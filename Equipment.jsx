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
    name: "", description: "", acquisition_type: "own",
    operational_cost: "", unit: "hours", price_per_unit: ""
};

const unitLabels = { hours: "Часы", days: "Дни", full: "Полная стоимость" };

export default function Equipment() {
    const [equipment, setEquipment] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [editId, setEditId] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => { fetchEquipment(); }, []);

    const fetchEquipment = async () => {
        try {
            const res = await api.get("/equipment");
            setEquipment(res.data);
        } catch {
            setError("Ошибка загрузки оборудования");
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
                await api.put(`/equipment/${editId}`, form);
            } else {
                await api.post("/equipment", form);
            }
            setOpen(false);
            fetchEquipment();
        } catch {
            setError("Ошибка сохранения");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Удалить оборудование?")) {
            await api.delete(`/equipment/${id}`);
            fetchEquipment();
        }
    };

    if (loading) return <CircularProgress />;

    return (
        <Box>
            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", alignItems: { xs: "stretch", sm: "center" }, gap: 1.5, mb: 3 }}>
                <Typography variant="h5" fontWeight="bold">Реестр оборудования</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
                    Добавить оборудование
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Название</TableCell>
                            <TableCell>Тип приобретения</TableCell>
                            <TableCell>Эксплуатационная стоимость</TableCell>
                            <TableCell>Единица измерения</TableCell>
                            <TableCell>Стоимость за единицу</TableCell>
                            <TableCell>Действия</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {equipment.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>{item.name}</TableCell>
                                <TableCell>{item.acquisition_type === "own" ? "Собственное" : "В аренде"}</TableCell>
                                <TableCell>{item.operational_cost ? Number(item.operational_cost).toLocaleString() + " руб." : "—"}</TableCell>
                                <TableCell>{unitLabels[item.unit]}</TableCell>
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
                <DialogTitle>{editId ? "Редактировать оборудование" : "Добавить оборудование"}</DialogTitle>
                <DialogContent>
                    <TextField label="Название" fullWidth value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })} sx={{ mt: 2, mb: 2 }} />
                    <TextField label="Описание" fullWidth multiline rows={2} value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })} sx={{ mb: 2 }} />
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Тип приобретения</InputLabel>
                        <Select value={form.acquisition_type} label="Тип приобретения"
                            onChange={(e) => setForm({ ...form, acquisition_type: e.target.value })}>
                            <MenuItem value="own">Собственное</MenuItem>
                            <MenuItem value="rent">В аренде</MenuItem>
                        </Select>
                    </FormControl>
                    {form.acquisition_type === "rent" && (
                        <TextField label="Эксплуатационная стоимость (руб.)" fullWidth type="number"
                            value={form.operational_cost}
                            onChange={(e) => setForm({ ...form, operational_cost: e.target.value })} sx={{ mb: 2 }} />
                    )}
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