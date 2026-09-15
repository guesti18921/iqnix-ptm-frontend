import { useState, useEffect } from "react";
import api from "../services/api";
import {
    Box, Button, Typography, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, Dialog,
    DialogTitle, DialogContent, DialogActions, TextField,
    Select, MenuItem, FormControl, InputLabel, IconButton,
    Alert, CircularProgress
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

const emptyForm = {
    type: "legal", company_name: "", inn: "",
    contact_person: "", email: "", phone: "",
    unit: "hours", price_per_unit: "", tax_rate: 0
};

const unitLabels = { hours: "Часы", days: "Дни", full: "Полная стоимость" };

export default function Subcontractors() {
    const [subcontractors, setSubcontractors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [editId, setEditId] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => { fetchSubcontractors(); }, []);

    const fetchSubcontractors = async () => {
        try {
            const res = await api.get("/subcontractors");
            setSubcontractors(res.data);
        } catch {
            setError("Ошибка загрузки субподрядчиков");
        } finally {
            setLoading(false);
        }
    };

    const handleOpen = (item = null) => {
        if (item) {
            setForm(item);
            setEditId(item.id);
        } else {
            setForm(emptyForm);
            setEditId(null);
        }
        setOpen(true);
    };

    const handleSave = async () => {
        try {
            if (editId) {
                await api.put(`/subcontractors/${editId}`, form);
            } else {
                await api.post("/subcontractors", form);
            }
            setOpen(false);
            fetchSubcontractors();
        } catch {
            setError("Ошибка сохранения");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Удалить субподрядчика?")) {
            await api.delete(`/subcontractors/${id}`);
            fetchSubcontractors();
        }
    };

    if (loading) return <CircularProgress />;

    return (
        <Box>
            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", alignItems: { xs: "stretch", sm: "center" }, gap: 1.5, mb: 3 }}>
                <Typography variant="h5" fontWeight="bold">Реестр субподрядчиков</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
                    Добавить субподрядчика
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Тип</TableCell>
                            <TableCell>Название</TableCell>
                            <TableCell>ИНН</TableCell>
                            <TableCell>Контактное лицо</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Телефон</TableCell>
                            <TableCell>Нал. ставка</TableCell>
                            <TableCell>Стоимость за единицу</TableCell>
                            <TableCell>Действия</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {subcontractors.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>{item.type === "legal" ? "ЮЛ" : "ИП"}</TableCell>
                                <TableCell>{item.company_name}</TableCell>
                                <TableCell>{item.inn}</TableCell>
                                <TableCell>{item.contact_person}</TableCell>
                                <TableCell>{item.email}</TableCell>
                                <TableCell>{item.phone}</TableCell>
                                <TableCell>{Number(item.tax_rate || 0).toFixed(2)}%</TableCell>
                                <TableCell>{Number(item.price_per_unit).toLocaleString()} руб.</TableCell>
                                <TableCell>
                                    <IconButton onClick={() => handleOpen(item)}><EditIcon /></IconButton>
                                    <IconButton color="error" onClick={() => handleDelete(item.id)}><DeleteIcon /></IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editId ? "Редактировать субподрядчика" : "Добавить субподрядчика"}</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
                        <InputLabel>Тип</InputLabel>
                        <Select value={form.type} label="Тип"
                            onChange={(e) => setForm({ ...form, type: e.target.value })}>
                            <MenuItem value="legal">Юридическое лицо</MenuItem>
                            <MenuItem value="entrepreneur">Индивидуальный предприниматель</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField label="Название организации" fullWidth value={form.company_name}
                        onChange={(e) => setForm({ ...form, company_name: e.target.value })} sx={{ mb: 2 }} />
                    <TextField label="ИНН" fullWidth value={form.inn}
                        onChange={(e) => setForm({ ...form, inn: e.target.value })} sx={{ mb: 2 }} />
                    <TextField label="Контактное лицо" fullWidth value={form.contact_person}
                        onChange={(e) => setForm({ ...form, contact_person: e.target.value })} sx={{ mb: 2 }} />
                    <TextField label="Email" fullWidth value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })} sx={{ mb: 2 }} />
                    <TextField label="Телефон" fullWidth value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })} sx={{ mb: 2 }} />
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Единица измерения</InputLabel>
                        <Select value={form.unit} label="Единица измерения"
                            onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                            <MenuItem value="hours">Часы</MenuItem>
                            <MenuItem value="days">Дни</MenuItem>
                            <MenuItem value="full">Полная стоимость</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        label="Налоговая ставка (%)"
                        fullWidth
                        type="number"
                        value={form.tax_rate}
                        onChange={(e) => setForm({ ...form, tax_rate: e.target.value })}
                        helperText="0% — расчёт как оборудование, >0% — расчёт как исполнитель (ГПХ)"
                        sx={{ mb: 2 }}
                    />
                    <TextField label="Стоимость за единицу (руб.)" fullWidth type="number"
                        value={form.price_per_unit}
                        onChange={(e) => setForm({ ...form, price_per_unit: e.target.value })} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Отмена</Button>
                    <Button variant="contained" onClick={handleSave}>Сохранить</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}