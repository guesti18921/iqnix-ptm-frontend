import { useState, useEffect } from "react";
import api from "../services/api";
import {
    Box, Button, Typography, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, Dialog,
    DialogTitle, DialogContent, DialogActions, TextField,
    IconButton, Alert, CircularProgress
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

const emptyForm = {
    last_name: "", first_name: "", middle_name: "",
    position: "", salary: "", tax_rate: "30.2"
};

export default function Employees() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [editId, setEditId] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => { fetchEmployees(); }, []);

    const fetchEmployees = async () => {
        try {
            const res = await api.get("/employees");
            setEmployees(res.data);
        } catch {
            setError("Ошибка загрузки сотрудников");
        } finally {
            setLoading(false);
        }
    };

    const handleOpen = (employee = null) => {
        if (employee) {
            setForm(employee);
            setEditId(employee.id);
        } else {
            setForm(emptyForm);
            setEditId(null);
        }
        setOpen(true);
    };

    const handleSave = async () => {
        try {
            if (editId) {
                await api.put(`/employees/${editId}`, form);
            } else {
                await api.post("/employees", form);
            }
            setOpen(false);
            fetchEmployees();
        } catch {
            setError("Ошибка сохранения");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Удалить сотрудника?")) {
            await api.delete(`/employees/${id}`);
            fetchEmployees();
        }
    };

    if (loading) return <CircularProgress />;

    return (
        <Box>
            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", alignItems: { xs: "stretch", sm: "center" }, gap: 1.5, mb: 3 }}>
                <Typography variant="h5" fontWeight="bold">Реестр сотрудников</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
                    Добавить сотрудника
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ФИО</TableCell>
                            <TableCell>Должность</TableCell>
                            <TableCell>Оклад (руб.)</TableCell>
                            <TableCell>Налоговая ставка (%)</TableCell>
                            <TableCell>Действия</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {employees.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 4, color: "text.secondary" }}>
                                    Нет данных
                                </TableCell>
                            </TableRow>
                        ) : (
                            employees.map((e) => (
                                <TableRow key={e.id}>
                                    <TableCell>{e.last_name} {e.first_name} {e.middle_name}</TableCell>
                                    <TableCell>{e.position}</TableCell>
                                    <TableCell>{Number(e.salary).toLocaleString()} руб.</TableCell>
                                    <TableCell>{e.tax_rate}%</TableCell>
                                    <TableCell>
                                        <IconButton onClick={() => handleOpen(e)}><EditIcon /></IconButton>
                                        <IconButton color="error" onClick={() => handleDelete(e.id)}><DeleteIcon /></IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editId ? "Редактировать сотрудника" : "Добавить сотрудника"}</DialogTitle>
                <DialogContent>
                    <TextField label="Фамилия" fullWidth value={form.last_name}
                        onChange={(e) => setForm({ ...form, last_name: e.target.value })} sx={{ mt: 2, mb: 2 }} />
                    <TextField label="Имя" fullWidth value={form.first_name}
                        onChange={(e) => setForm({ ...form, first_name: e.target.value })} sx={{ mb: 2 }} />
                    <TextField label="Отчество" fullWidth value={form.middle_name}
                        onChange={(e) => setForm({ ...form, middle_name: e.target.value })} sx={{ mb: 2 }} />
                    <TextField label="Должность" fullWidth value={form.position}
                        onChange={(e) => setForm({ ...form, position: e.target.value })} sx={{ mb: 2 }} />
                    <TextField label="Оклад в месяц (руб.)" fullWidth type="number" value={form.salary}
                        onChange={(e) => setForm({ ...form, salary: e.target.value })} sx={{ mb: 2 }} />
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