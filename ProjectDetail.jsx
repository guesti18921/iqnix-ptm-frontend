import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import MDEditor, { commands } from "@uiw/react-md-editor";
import { useThemeMode } from "../main";
import {
    Box, Button, Typography, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, Dialog,
    DialogTitle, DialogContent, DialogActions, TextField,
    Select, MenuItem, FormControl, InputLabel, IconButton,
    Alert, CircularProgress, Chip, Divider, Grid,
    ToggleButton, ToggleButtonGroup
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import TableChartIcon from "@mui/icons-material/TableChart";
import DescriptionIcon from "@mui/icons-material/Description";
import ArticleIcon from "@mui/icons-material/Article";

const emptyResource = {
    resource_name: "", resource_type: "employee",
    resource_id: "", service_name: "",
    start_date: "", end_date: "",
    quantity: "1", margin: "0",
    calculation_mode: "simple",
    focusStart: false, focusEnd: false
};

const resourceTypeLabels = {
    employee: "Сотрудник",
    contractor: "Исполнитель",
    subcontractor: "Субподрядчик",
    equipment: "Оборудование"
};

const statusLabels = {
    draft: "Черновик",
    in_progress: "В работе",
    completed: "Завершён"
};

const statusColors = {
    draft: "default",
    in_progress: "primary",
    completed: "success"
};

const editorCommands = [
    { ...commands.bold, buttonProps: { "aria-label": "Жирный", title: "Жирный" } },
    { ...commands.italic, buttonProps: { "aria-label": "Курсив", title: "Курсив" } },
    { ...commands.strikethrough, buttonProps: { "aria-label": "Зачёркнутый", title: "Зачёркнутый" } },
    commands.divider,
    { ...commands.link, buttonProps: { "aria-label": "Вставить ссылку", title: "Вставить ссылку" } },
];

export default function ProjectDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { hasRole } = useAuth();
    const { mode } = useThemeMode();
    const canSeeMargin = hasRole("admin") || hasRole("commercial_director");

    const [project, setProject] = useState(null);
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [showTZ, setShowTZ] = useState(false);
    const [tz, setTz] = useState("");
    const [savingTZ, setSavingTZ] = useState(false);
    const [uploadingFile, setUploadingFile] = useState(false);
    const [form, setForm] = useState(emptyResource);
    const [resourceList, setResourceList] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => { fetchProject(); }, [id]);

    const fetchProject = async () => {
        try {
            const res = await api.get(`/projects/${id}`);
            setProject(res.data);
            setResources(res.data.resources || []);
            setTz(res.data.technical_task || "");
        } catch {
            setError("Ошибка загрузки проекта");
        } finally {
            setLoading(false);
        }
    };

    const fetchResourceList = async (type) => {
        try {
            const endpoints = {
                employee: "/employees",
                contractor: "/contractors",
                subcontractor: "/subcontractors",
                equipment: "/equipment"
            };
            const res = await api.get(endpoints[type]);
            setResourceList(res.data);
        } catch {}
    };

    const handleTypeChange = (type) => {
        setForm({ ...form, resource_type: type, resource_id: "" });
        fetchResourceList(type);
    };

    const handleOpen = () => {
        setForm(emptyResource);
        fetchResourceList("employee");
        setOpen(true);
    };

    const handleSave = async () => {
        try {
            await api.post(`/projects/${id}/resources`, {
                resource_name: form.resource_name,
                resource_type: form.resource_type,
                resource_id: form.resource_id,
                calculation_mode: form.calculation_mode,
                service_name: form.service_name,
                start_date: form.start_date,
                end_date: form.end_date,
                quantity: form.quantity,
                margin: form.margin,
            });
            setOpen(false);
            fetchProject();
        } catch (err) {
            setError("Ошибка сохранения: " + (err.response?.data?.message || ""));
        }
    };

    const handleFileUpload = async (file, api2, setTzValue) => {
        if (!file) return;
        setUploadingFile(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const res = await api.post("/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            const { url, name, is_image } = res.data;
            const markdown = is_image ? `\n![${name}](${url})\n` : `\n[${name}](${url})\n`;
            setTzValue((prev) => (prev || "") + markdown);
        } catch (err) {
            setError("Ошибка загрузки файла: " + (err.response?.data?.message || ""));
        } finally {
            setUploadingFile(false);
        }
    };

    // Кастомная кнопка загрузки файла для панели редактора
    const uploadCommand = {
        name: "upload",
        keyCommand: "upload",
        buttonProps: { "aria-label": "Загрузить файл", title: "Загрузить файл (изображение или документ)" },
        icon: (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
        ),
        execute: () => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/*,.pdf,.doc,.docx";
            input.onchange = (e) => {
                const file = e.target.files[0];
                handleFileUpload(file, null, setTz);
            };
            input.click();
        },
    };

    const handleSaveTZ = async () => {
        setSavingTZ(true);
        try {
            await api.put(`/projects/${id}`, { technical_task: tz });
            setShowTZ(false);
            fetchProject();
        } catch {
            setError("Ошибка сохранения ТЗ");
        } finally {
            setSavingTZ(false);
        }
    };

    const handleDelete = async (resourceId) => {
        if (window.confirm("Удалить ресурс?")) {
            await api.delete(`/projects/${id}/resources/${resourceId}`);
            fetchProject();
        }
    };

    const handleDownload = async (url, filename) => {
        setError("");
        try {
            const response = await api.get(url, { responseType: "blob" });
            const type = response.headers["content-type"] || response.data.type || "";
            if (/json|text\/html/i.test(type)) {
                throw new Error("Сервер вернул ответ вместо документа");
            }
            const objectUrl = URL.createObjectURL(response.data);
            const link = document.createElement("a");
            link.href = objectUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            link.remove();
            setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
        } catch (err) {
            const status = err.response?.status;
            setError(status === 401
                ? "Сессия истекла. Войдите снова."
                : `Ошибка скачивания документа${status ? ` (HTTP ${status})` : ""}. Попробуйте ещё раз; при повторении проверьте логи backend.`);
        }
    };

    const getResourceName = (item) => {
        if (!item) return "";
        if (item.last_name) return `${item.last_name} ${item.first_name}`;
        if (item.company_name) return item.company_name;
        if (item.name) return item.name;
        return "";
    };

    const totalCost = resources.reduce((sum, r) => sum + Number(r.cost_price || 0), 0);
    const totalPrice = resources.reduce((sum, r) => sum + Number(r.total_price || 0), 0);
    const totalProfit = totalPrice - totalCost;
    const finalPrice = totalPrice + (totalPrice * Number(project?.tax_rate || 0) / 100);

    if (loading) return <CircularProgress />;

    return (
        <Box>
            <Box display="flex" alignItems="center" mb={3}>
                <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
                    <ArrowBackIcon />
                </IconButton>
                <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <Typography variant="h5" fontWeight="bold">{project?.name}</Typography>
                    <Chip
                        label={statusLabels[project?.status] || project?.status}
                        color={statusColors[project?.status] || "default"}
                        size="small"
                        sx={{ mt: 1 }}
                    />
                </Box>
                <Box sx={{ width: 40 }} />
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {/* Итоговые показатели */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6} sm={canSeeMargin ? 3 : 6}>
                    <Paper sx={{ p: 2, textAlign: "center" }}>
                        <Typography variant="body2" color="text.secondary">Себестоимость</Typography>
                        <Typography variant="h6" fontWeight="bold">
                            {totalCost.toLocaleString()} руб.
                        </Typography>
                    </Paper>
                </Grid>
                {canSeeMargin && (
                    <Grid item xs={6} sm={3}>
                        <Paper sx={{ p: 2, textAlign: "center" }}>
                            <Typography variant="body2" color="text.secondary">С маржинальностью</Typography>
                            <Typography variant="h6" fontWeight="bold" color="primary">
                                {totalPrice.toLocaleString()} руб.
                            </Typography>
                        </Paper>
                    </Grid>
                )}
                {canSeeMargin && (
                    <Grid item xs={6} sm={3}>
                        <Paper sx={{ p: 2, textAlign: "center" }}>
                            <Typography variant="body2" color="text.secondary">Чистая прибыль</Typography>
                            <Typography variant="h6" fontWeight="bold" color="success.main">
                                {totalProfit.toLocaleString()} руб.
                            </Typography>
                        </Paper>
                    </Grid>
                )}
                <Grid item xs={6} sm={canSeeMargin ? 3 : 6}>
                    <Paper sx={{ p: 2, textAlign: "center" }}>
                        <Typography variant="body2" color="text.secondary">
                            Итого с налогом ({project?.tax_rate}%)
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" color="error">
                            {finalPrice.toLocaleString()} руб.
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>

            {/* Кнопки документов */}
            <Box display="flex" gap={1} mb={3} alignItems="center" flexWrap="wrap">
                <Typography variant="h6" sx={{ mr: 1 }}>НМА:</Typography>
                <Button size="small" startIcon={<PictureAsPdfIcon />} variant="outlined"
                    onClick={() => handleDownload(`/projects/${id}/nma/pdf`, `nma_${id}.pdf`)}>PDF</Button>
                <Button size="small" startIcon={<TableChartIcon />} variant="outlined"
                    onClick={() => handleDownload(`/projects/${id}/nma/excel`, `nma_${id}.xlsx`)}>Excel</Button>
                <Button size="small" startIcon={<DescriptionIcon />} variant="outlined"
                    onClick={() => handleDownload(`/projects/${id}/nma/word`, `nma_${id}.docx`)}>Word</Button>

                {project?.customer_id && (
                    <>
                        <Typography variant="h6" sx={{ mx: 1 }}>КП:</Typography>
                        <Button size="small" startIcon={<PictureAsPdfIcon />} variant="outlined" color="secondary"
                            onClick={() => handleDownload(`/projects/${id}/kp/pdf`, `kp_${id}.pdf`)}>PDF</Button>
                        <Button size="small" startIcon={<TableChartIcon />} variant="outlined" color="secondary"
                            onClick={() => handleDownload(`/projects/${id}/kp/excel`, `kp_${id}.xlsx`)}>Excel</Button>
                        <Button size="small" startIcon={<DescriptionIcon />} variant="outlined" color="secondary"
                            onClick={() => handleDownload(`/projects/${id}/kp/word`, `kp_${id}.docx`)}>Word</Button>
                    </>
                )}

                <Button size="small" startIcon={<ArticleIcon />} variant="outlined" color="info"
                    onClick={() => setShowTZ(true)} sx={{ ml: 2 }}>
                    {project?.technical_task ? "Редактировать ТЗ" : "Добавить ТЗ"}
                </Button>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Показать ТЗ если есть */}
            {project?.technical_task && (
                <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" mb={2}>Техническое задание</Typography>
                    <Box
                        data-color-mode={mode}
                        onClick={(e) => {
                            if (e.target.tagName === "IMG") {
                                window.open(e.target.src, "_blank");
                            }
                        }}
                        sx={{
                            "& img": {
                                maxWidth: 400,
                                maxHeight: 400,
                                borderRadius: 1,
                                cursor: "pointer",
                                display: "block",
                            },
                        }}
                    >
                        <MDEditor.Markdown source={project.technical_task} style={{ background: "transparent" }} />
                    </Box>
                </Paper>
            )}

            {/* Ресурсы проекта */}
            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", alignItems: { xs: "stretch", sm: "center" }, gap: 1.5, mb: 2 }}>
                <Typography variant="h6">Ресурсы проекта</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>
                    Добавить ресурс
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Название</TableCell>
                            <TableCell>Тип</TableCell>
                            <TableCell>Услуга</TableCell>
                            <TableCell>Период</TableCell>
                            <TableCell>Кол-во</TableCell>
                            <TableCell>Расчёт</TableCell>
                            <TableCell>Себестоимость</TableCell>
                            {canSeeMargin && <TableCell>Маржа %</TableCell>}
                            <TableCell>Итого</TableCell>
                            <TableCell>Действия</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {resources.map((r) => (
                            <TableRow key={r.id}>
                                <TableCell>{r.resource_name}</TableCell>
                                <TableCell>{resourceTypeLabels[r.resource_type]}</TableCell>
                                <TableCell>{r.service_name}</TableCell>
                                <TableCell>{r.start_date} — {r.end_date}</TableCell>
                                <TableCell>{r.quantity}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={r.calculation_mode === "precise" ? "Точный" : "Упрощённый"}
                                        size="small"
                                        color={r.calculation_mode === "precise" ? "primary" : "default"}
                                    />
                                </TableCell>
                                <TableCell>{Number(r.cost_price).toLocaleString()} руб.</TableCell>
                                {canSeeMargin && <TableCell>{r.margin}%</TableCell>}
                                <TableCell>{Number(r.total_price).toLocaleString()} руб.</TableCell>
                                <TableCell>
                                    <IconButton color="error" onClick={() => handleDelete(r.id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Диалог ТЗ */}
            <Dialog open={showTZ} onClose={() => setShowTZ(false)} maxWidth="md" fullWidth>
                <DialogTitle>Техническое задание</DialogTitle>
                <DialogContent>
                    <Box mt={2} data-color-mode={mode}>
                        {uploadingFile && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                Загрузка файла...
                            </Typography>
                        )}
                        <MDEditor
                            value={tz}
                            onChange={setTz}
                            height={400}
                            preview="edit"
                            commands={[...editorCommands, uploadCommand]}
                            extraCommands={[]}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowTZ(false)}>Отмена</Button>
                    <Button variant="contained" onClick={handleSaveTZ} disabled={savingTZ}>
                        {savingTZ ? "Сохранение..." : "Сохранить"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Диалог добавления ресурса */}
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Добавить ресурс</DialogTitle>
                <DialogContent>
                    <TextField label="Название ресурса" fullWidth value={form.resource_name}
                        onChange={(e) => setForm({ ...form, resource_name: e.target.value })} sx={{ mt: 2, mb: 2 }} />
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Тип ресурса</InputLabel>
                        <Select value={form.resource_type} label="Тип ресурса"
                            onChange={(e) => handleTypeChange(e.target.value)}>
                            <MenuItem value="employee">Сотрудник</MenuItem>
                            <MenuItem value="contractor">Исполнитель</MenuItem>
                            <MenuItem value="subcontractor">Субподрядчик</MenuItem>
                            <MenuItem value="equipment">Оборудование</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Выбор исполнителя</InputLabel>
                        <Select value={form.resource_id} label="Выбор исполнителя"
                            onChange={(e) => setForm({ ...form, resource_id: e.target.value })}>
                            {resourceList.map((r) => (
                                <MenuItem key={r.id} value={r.id}>{getResourceName(r)}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {form.resource_type === "employee" && (
                        <Box mb={2}>
                            <Typography variant="body2" color="text.secondary" mb={1}>
                                Метод расчёта
                            </Typography>
                            <ToggleButtonGroup
                                value={form.calculation_mode}
                                exclusive
                                onChange={(e, val) => val && setForm({ ...form, calculation_mode: val })}
                                fullWidth
                            >
                                <ToggleButton value="simple">Упрощённый</ToggleButton>
                                <ToggleButton value="precise">Точный (по календарю)</ToggleButton>
                            </ToggleButtonGroup>
                        </Box>
                    )}

                    <TextField label="Название услуги" fullWidth value={form.service_name}
                        onChange={(e) => setForm({ ...form, service_name: e.target.value })} sx={{ mb: 2 }} />
                    <TextField
                        label="Дата начала" fullWidth
                        type={form.start_date || form.focusStart ? "date" : "text"}
                        value={form.start_date}
                        onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                        onFocus={() => setForm({ ...form, focusStart: true })}
                        onBlur={() => setForm({ ...form, focusStart: false })}
                        InputLabelProps={{ shrink: true }} sx={{ mb: 2 }} />
                    <TextField
                        label="Дата окончания" fullWidth
                        type={form.end_date || form.focusEnd ? "date" : "text"}
                        value={form.end_date}
                        onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                        onFocus={() => setForm({ ...form, focusEnd: true })}
                        onBlur={() => setForm({ ...form, focusEnd: false })}
                        InputLabelProps={{ shrink: true }} sx={{ mb: 2 }} />
                    <TextField
                        label={form.resource_type === "employee" ? "Количество дней (упрощённый расчёт)" : "Количество единиц"}
                        helperText={form.resource_type === "employee"
                            ? (form.calculation_mode === "precise"
                                ? "Стоимость считается по датам, понедельник–пятница. Количество здесь не используется."
                                : "1 = один день по ставке месячная стоимость / 30. Даты не влияют на сумму.")
                            : ""}
                        disabled={form.resource_type === "employee" && form.calculation_mode === "precise"}
                        fullWidth type="number" value={form.quantity}
                        onChange={(e) => setForm({ ...form, quantity: e.target.value })} sx={{ mb: 2 }} />
                    {canSeeMargin && (
                        <TextField label="Маржинальность (%)" fullWidth type="number" value={form.margin}
                            onChange={(e) => setForm({ ...form, margin: e.target.value })} />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Отмена</Button>
                    <Button variant="contained" onClick={handleSave}>Сохранить</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}