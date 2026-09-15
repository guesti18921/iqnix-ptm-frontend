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
    inn: "", type: "individual", company_name: "",
    full_name: "", email: "", phone: ""
};

export default function Customers() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [editId, setEditId] = useState(null);
    const [error, setError] = useState("");

    const typeLabels = {
        individual: "Физическое лицо",
        entrepreneur: "Индивидуальный предприниматель",
        legal: "Юридическое лицо"
    };

    useEffect(() => { fetchCustomers(); }, []);

    const fetchCustomers = async () => {
        try {
            const res = await api.get("/customers");
            setCustomers(res.data);
        } catch {
            setError("Ошибка загрузки заказчиков");
        } finally {
            setLoading(false);
        }
    };

    const handleOpen = (customer = null) => {
        if (customer) {
            setForm(customer);
            setEditId(customer.id);
        } else {
            setForm(emptyForm);
            setEditId(null);
        }
        setOpen(true);
    };

    const handleSave = async () => {
        try {
            if (editId) {
                await api.put(`/customers/${editId}`, form);
            } else {
                await api.post("/customers", form);
            }
            setOpen(false);
            fetchCustomers();
        } catch {
            setError("Ошибка сохранения");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Удалить заказчика?")) {
            await api.delete(`/customers/${id}`);
            fetchCustomers();
        }
    };

    if (loading) return <CircularProgress />;

    return (
        <Box>
            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", alignItems: { xs: "stretch", sm: "center" }, gap: 1.5, mb: 3 }}>
                <Typography variant="h5" fontWeight="bold">Реестр заказчиков</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
                    Добавить заказчика
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ИНН</TableCell>
                            <TableCell>Тип</TableCell>
                            <TableCell>ФИО / Название</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Телефон</TableCell>
                            <TableCell>Действия</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {customers.map((c) => (
                            <TableRow key={c.id}>
                                <TableCell>{c.inn}</TableCell>
                                <TableCell>{typeLabels[c.type]}</TableCell>
                                <TableCell>{c.company_name || c.full_name}</TableCell>
                                <TableCell>{c.email}</TableCell>
                                <TableCell>{c.phone}</TableCell>
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
                <DialogTitle>{editId ? "Редактировать заказчика" : "Добавить заказчика"}</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
                        <InputLabel>Тип заказчика</InputLabel>
                        <Select value={form.type} label="Тип заказчика"
                            onChange={(e) => setForm({ ...form, type: e.target.value })}>
                            <MenuItem value="individual">Физическое лицо</MenuItem>
                            <MenuItem value="entrepreneur">Индивидуальный предприниматель</MenuItem>
                            <MenuItem value="legal">Юридическое лицо</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField label="ИНН" fullWidth value={form.inn}
                        onChange={(e) => setForm({ ...form, inn: e.target.value })} sx={{ mb: 2 }} />
                    {(form.type === "entrepreneur" || form.type === "legal") && (
                        <TextField label="Название организации" fullWidth value={form.company_name}
                            onChange={(e) => setForm({ ...form, company_name: e.target.value })} sx={{ mb: 2 }} />
                    )}
                    <TextField label={form.type === "legal" ? "ФИО руководителя" : "ФИО"} fullWidth
                        value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} sx={{ mb: 2 }} />
                    <TextField label="Email" fullWidth value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })} sx={{ mb: 2 }} />
                    <TextField label="Телефон" fullWidth value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Отмена</Button>
                    <Button variant="contained" onClick={handleSave}>Сохранить</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}