import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import {
    Box, Button, Typography, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, Dialog,
    DialogTitle, DialogContent, DialogActions, TextField,
    Select, MenuItem, FormControl, InputLabel, IconButton,
    Alert, CircularProgress, Chip
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";

const emptyForm = {
    name: "", description: "", start_date: "",
    end_date: "", customer_id: "", tax_rate: "0",
    status: "draft", focusStart: false, focusEnd: false
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

export default function Projects() {
    const { workspaceId } = useParams();
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [editId, setEditId] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchProjects();
        fetchCustomers();
    }, [workspaceId]);

    const fetchProjects = async () => {
        try {
            const res = await api.get(`/workspaces/${workspaceId}/projects`);
            setProjects(res.data);
        } catch {
            setError("Ошибка загрузки проектов");
        } finally {
            setLoading(false);
        }
    };

    const fetchCustomers = async () => {
        try {
            const res = await api.get("/customers");
            setCustomers(res.data);
        } catch {}
    };

    const handleOpen = (project = null) => {
        if (project) {
            setForm({ ...project, focusStart: false, focusEnd: false });
            setEditId(project.id);
        } else {
            setForm(emptyForm);
            setEditId(null);
        }
        setOpen(true);
    };

    const handleSave = async () => {
        try {
            const data = {
                name: form.name,
                description: form.description,
                start_date: form.start_date,
                end_date: form.end_date,
                customer_id: form.customer_id,
                tax_rate: form.tax_rate,
                status: form.status,
                workspace_id: workspaceId,
            };
            if (editId) {
                await api.put(`/projects/${editId}`, data);
            } else {
                await api.post("/projects", data);
            }
            setOpen(false);
            fetchProjects();
        } catch (err) {
            setError("Ошибка сохранения: " + (err.response?.data?.message || ""));
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Удалить проект?")) {
            await api.delete(`/projects/${id}`);
            fetchProjects();
        }
    };

    if (loading) return <CircularProgress />;

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" fontWeight="bold">Проекты рабочей области</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
                    Создать проект
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Название</TableCell>
                            <TableCell>Статус</TableCell>
                            <TableCell>Заказчик</TableCell>
                            <TableCell>Срок</TableCell>
                            <TableCell>Себестоимость</TableCell>
                            <TableCell>Итого</TableCell>
                            <TableCell>Действия</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {projects.map((p) => (
                            <TableRow key={p.id}>
                                <TableCell>{p.name}</TableCell>
                                <TableCell>
                                    <Chip label={statusLabels[p.status]} color={statusColors[p.status]} size="small" />
                                </TableCell>
                                <TableCell>{p.customer?.full_name || "—"}</TableCell>
                                <TableCell>{p.start_date} — {p.end_date}</TableCell>
                                <TableCell>{Number(p.cost_price || 0).toLocaleString()} руб.</TableCell>
                                <TableCell>{Number(p.final_price || 0).toLocaleString()} руб.</TableCell>
                                <TableCell>
                                    <IconButton color="primary" onClick={() => navigate(`/projects/${p.id}`)}>
                                        <VisibilityIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleOpen(p)}><EditIcon /></IconButton>
                                    <IconButton color="error" onClick={() => handleDelete(p.id)}><DeleteIcon /></IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editId ? "Редактировать проект" : "Создать проект"}</DialogTitle>
                <DialogContent>
                    <TextField label="Название проекта" fullWidth value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })} sx={{ mt: 2, mb: 2 }} />
                    <TextField label="Описание" fullWidth multiline rows={3} value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })} sx={{ mb: 2 }} />
                    <TextField
                        label="Дата начала"
                        fullWidth
                        type={form.start_date || form.focusStart ? "date" : "text"}
                        value={form.start_date}
                        onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                        onFocus={() => setForm({ ...form, focusStart: true })}
                        onBlur={() => setForm({ ...form, focusStart: false })}
                        InputLabelProps={{ shrink: true }}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        label="Дата окончания"
                        fullWidth
                        type={form.end_date || form.focusEnd ? "date" : "text"}
                        value={form.end_date}
                        onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                        onFocus={() => setForm({ ...form, focusEnd: true })}
                        onBlur={() => setForm({ ...form, focusEnd: false })}
                        InputLabelProps={{ shrink: true }}
                        sx={{ mb: 2 }}
                    />
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Заказчик</InputLabel>
                        <Select value={form.customer_id} label="Заказчик"
                            onChange={(e) => setForm({ ...form, customer_id: e.target.value })}>
                            <MenuItem value="">Без заказчика</MenuItem>
                            {customers.map((c) => (
                                <MenuItem key={c.id} value={c.id}>{c.full_name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Статус</InputLabel>
                        <Select value={form.status} label="Статус"
                            onChange={(e) => setForm({ ...form, status: e.target.value })}>
                            <MenuItem value="draft">Черновик</MenuItem>
                            <MenuItem value="in_progress">В работе</MenuItem>
                            <MenuItem value="completed">Завершён</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField label="Налоговая ставка (%)" fullWidth type="number" value={form.tax_rate}
                        onChange={(e) => setForm({ ...form, tax_rate: e.target.value })} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Отмена</Button>
                    <Button variant="contained" onClick={handleSave}>Сохранить</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}