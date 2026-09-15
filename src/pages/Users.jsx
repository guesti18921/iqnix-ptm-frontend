import { useState, useEffect } from "react";
import api from "../services/api";
import {
    Box, Button, Typography, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, Dialog,
    DialogTitle, DialogContent, DialogActions, TextField,
    Select, MenuItem, FormControl, InputLabel, IconButton,
    Alert, CircularProgress, Chip, Checkbox, ListItemText,
    OutlinedInput, InputAdornment
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const emptyForm = {
    name: "", last_name: "", middle_name: "",
    email: "", password: "", position: "",
    roles: []
};

const roleLabels = {
    admin: "Администратор",
    commercial_director: "Коммерческий директор",
    accountant: "Бухгалтер",
    hr: "Кадровик"
};

const allRoles = ["admin", "commercial_director", "accountant", "hr"];

export default function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [editId, setEditId] = useState(null);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => { fetchUsers(); }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get("/users");
            setUsers(res.data);
        } catch {
            setError("Ошибка загрузки пользователей");
        } finally {
            setLoading(false);
        }
    };

    const handleOpen = (user = null) => {
        setShowPassword(false);
        if (user) {
            setForm({
                name: user.name || "",
                last_name: user.last_name || "",
                middle_name: user.middle_name || "",
                email: user.email || "",
                password: "",
                position: user.position || "",
                roles: user.roles?.map(r => r.name) || []
            });
            setEditId(user.id);
        } else {
            setForm(emptyForm);
            setEditId(null);
        }
        setOpen(true);
    };

    const handleSave = async () => {
        try {
            if (editId) {
                await api.put(`/users/${editId}`, form);
            } else {
                await api.post("/users", form);
            }
            setOpen(false);
            fetchUsers();
        } catch (err) {
            setError("Ошибка сохранения: " + (err.response?.data?.message || ""));
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Удалить пользователя?")) {
            await api.delete(`/users/${id}`);
            fetchUsers();
        }
    };

    if (loading) return <CircularProgress />;

    return (
        <Box>
            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", alignItems: { xs: "stretch", sm: "center" }, gap: 1.5, mb: 3 }}>
                <Typography variant="h5" fontWeight="bold">Управление пользователями</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
                    Добавить пользователя
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ФИО</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Должность</TableCell>
                            <TableCell>Роли</TableCell>
                            <TableCell>Действия</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((u) => (
                            <TableRow key={u.id}>
                                <TableCell>{u.last_name} {u.name} {u.middle_name}</TableCell>
                                <TableCell>{u.email}</TableCell>
                                <TableCell>{u.position}</TableCell>
                                <TableCell>
                                    {u.roles?.map((r) => (
                                        <Chip key={r.name} label={roleLabels[r.name] || r.name}
                                            size="small" sx={{ mr: 0.5 }} color="primary" />
                                    ))}
                                </TableCell>
                                <TableCell>
                                    <IconButton onClick={() => handleOpen(u)}><EditIcon /></IconButton>
                                    <IconButton color="error" onClick={() => handleDelete(u.id)}><DeleteIcon /></IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editId ? "Редактировать пользователя" : "Добавить пользователя"}</DialogTitle>
                <DialogContent>
                    <TextField label="Фамилия" fullWidth value={form.last_name}
                        onChange={(e) => setForm({ ...form, last_name: e.target.value })} sx={{ mt: 2, mb: 2 }} />
                    <TextField label="Имя" fullWidth value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })} sx={{ mb: 2 }} />
                    <TextField label="Отчество" fullWidth value={form.middle_name}
                        onChange={(e) => setForm({ ...form, middle_name: e.target.value })} sx={{ mb: 2 }} />
                    <TextField label="Email" fullWidth value={form.email}
                        name="user-email-no-autofill" autoComplete="off"
                        onChange={(e) => setForm({ ...form, email: e.target.value })} sx={{ mb: 2 }} />
                    <TextField label={editId ? "Новый пароль (оставьте пустым чтобы не менять)" : "Пароль"}
                        fullWidth type={showPassword ? "text" : "password"} value={form.password}
                        name="user-password-no-autofill" autoComplete="new-password"
                        onChange={(e) => setForm({ ...form, password: e.target.value })} sx={{ mb: 2 }}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        edge="end"
                                        size="small"
                                        tabIndex={-1}
                                    >
                                        {showPassword
                                            ? <VisibilityOff sx={{ fontSize: 20 }} />
                                            : <Visibility sx={{ fontSize: 20 }} />
                                        }
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }} />
                    <TextField label="Должность" fullWidth value={form.position}
                        onChange={(e) => setForm({ ...form, position: e.target.value })} sx={{ mb: 2 }} />
                    <FormControl fullWidth>
                        <InputLabel>Роли</InputLabel>
                        <Select
                            multiple
                            value={form.roles}
                            onChange={(e) => setForm({ ...form, roles: e.target.value })}
                            input={<OutlinedInput label="Роли" />}
                            renderValue={(selected) => (
                                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                    {selected.map((value) => (
                                        <Chip key={value} label={roleLabels[value] || value} size="small" />
                                    ))}
                                </Box>
                            )}
                        >
                            {allRoles.map((role) => (
                                <MenuItem key={role} value={role}>
                                    <Checkbox checked={form.roles.includes(role)} />
                                    <ListItemText primary={roleLabels[role]} />
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Отмена</Button>
                    <Button variant="contained" onClick={handleSave}>Сохранить</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}