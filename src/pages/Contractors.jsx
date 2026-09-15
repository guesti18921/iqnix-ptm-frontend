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
    last_name: "", first_name: "", middle_name: "",
    contract_type: "npd", tax_rate: "0",
    unit: "hours", price_per_unit: ""
};

const unitLabels = { hours: "Часы", days: "Дни", full: "Полная стоимость" };

export default function Contractors() {
    const [contractors, setContractors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [editId, setEditId] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => { fetchContractors(); }, []);

    const fetchContractors = async () => {
        try {
            const res = await api.get("/contractors");
            setContractors(res.data);
        } catch {
            setError("Ошибка загрузки исполнителей");
        } finally {
            setLoading(false);
        }
    };

    const handleOpen = (contractor = null) => {
        if (contractor) {
            setForm(contractor);
            setEditId(contractor.id);
        } else {
            setForm(emptyForm);
            setEditId(null);
        }
        setOpen(true);
    };

    const handleSave = async () => {
        try {
            if (editId) {
                await api.put(`/contractors/${editId}`, form);
            } else {
                await api.post("/contractors", form);
            }
            setOpen(false);
            fetchContractors();
        } catch {
            setError("Ошибка сохранения");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Удалить исполнителя?")) {
            await api.delete(`/contractors/${id}`);
            fetchContractors();
        }
    };

    const handleTypeChange = (value) => {
        setForm({ ...form, contract_type: value, tax_rate: value === "npd" ? "0" : "" });
    };

    if (loading) return <CircularProgress />;

    return (
        <Box>
            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", alignItems: { xs: "stretch", sm: "center" }, gap: 1.5, mb: 3 }}>
                <Typography variant="h5" fontWeight="bold">Реестр исполнителей</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
                    Добавить исполнителя
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ФИО</TableCell>
                            <TableCell>Тип оформления</TableCell>
                            <TableCell>Налоговая ставка</TableCell>
                            <TableCell>Единица измерения</TableCell>
                            <TableCell>Стоимость за единицу</TableCell>
                            <TableCell>Действия</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {contractors.map((c) => (
                            <TableRow key={c.id}>
                                <TableCell>{c.last_name} {c.first_name} {c.middle_name}</TableCell>
                                <TableCell>{c.contract_type === "npd" ? "НПД" : "ГПХ"}</TableCell>
                                <TableCell>{c.tax_rate}%</TableCell>
                                <TableCell>{unitLabels[c.unit]}</TableCell>
                                <TableCell>{Number(c.price_per_unit).toLocaleString()} руб.</TableCell>
                                <TableCell>
                                    <IconButton onClick={() => handleOpen(c)}><EditIcon /></IconButton>
                                    <IconButton color="error" onClick={() => handleDelete(c.id)}><DeleteIcon /></IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editId ? "Редактировать исполнителя" : "Добавить исполнителя"}</DialogTitle>
                <DialogContent>
                    <TextField label="Фамилия" fullWidth value={form.last_name}
                        onChange={(e) => setForm({ ...form, last_name: e.target.value })} sx={{ mt: 2, mb: 2 }} />
                    <TextField label="Имя" fullWidth value={form.first_name}
                        onChange={(e) => setForm({ ...form, first_name: e.target.value })} sx={{ mb: 2 }} />
                    <TextField label="Отчество" fullWidth value={form.middle_name}
                        onChange={(e) => setForm({ ...form, middle_name: e.target.value })} sx={{ mb: 2 }} />
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Тип оформления</InputLabel>
                        <Select value={form.contract_type} label="Тип оформления"
                            onChange={(e) => handleTypeChange(e.target.value)}>
                            <MenuItem value="npd">НПД (самозанятый)</MenuItem>
                            <MenuItem value="gph">ГПХ</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField label="Налоговая ставка (%)" fullWidth type="number"
                        value={form.tax_rate} disabled={form.contract_type === "npd"}
                        onChange={(e) => setForm({ ...form, tax_rate: e.target.value })} sx={{ mb: 2 }} />
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Единица измерения</InputLabel>
                        <Select value={form.unit} label="Единица измерения"
                            onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                            <MenuItem value="hours">Часы</MenuItem>
                            <MenuItem value="days">Дни</MenuItem>
                            <MenuItem value="full">Полная стоимость</MenuItem>
                        </Select>
                    </FormControl>
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