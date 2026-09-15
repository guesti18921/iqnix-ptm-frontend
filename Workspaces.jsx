import { useState, useEffect } from "react";
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
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import { useNavigate } from "react-router-dom";

const emptyForm = { name: "", slug: "", admin_id: "" };

export default function Workspaces() {
    const [workspaces, setWorkspaces] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [editId, setEditId] = useState(null);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchWorkspaces();
        fetchUsers();
    }, []);

    const fetchWorkspaces = async () => {
        try {
            const res = await api.get("/workspaces");
            setWorkspaces(res.data);
        } catch {
            setError("Ошибка загрузки рабочих областей");
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await api.get("/users");
            setUsers(res.data);
        } catch {}
    };

    const handleOpen = (workspace = null) => {
        if (workspace) {
            setForm({ name: workspace.name, slug: workspace.slug, admin_id: workspace.admin_id });
            setEditId(workspace.id);
        } else {
            setForm(emptyForm);
            setEditId(null);
        }
        setOpen(true);
    };

    const handleSave = async () => {
        try {
            if (editId) {
                await api.put(`/workspaces/${editId}`, form);
            } else {
                await api.post("/workspaces", form);
            }
            setOpen(false);
            fetchWorkspaces();
        } catch (err) {
            setError("Ошибка сохранения: " + (err.response?.data?.message || ""));
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Удалить рабочую область?")) {
            await api.delete(`/workspaces/${id}`);
            fetchWorkspaces();
        }
    };

    const getUserName = (user) => {
        if (!user) return "";
        return `${user.last_name || ""} ${user.name || ""}`.trim();
    };

    if (loading) return <CircularProgress />;

    return (
        <Box>
            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", alignItems: { xs: "stretch", sm: "center" }, gap: 1.5, mb: 3 }}>
                <Typography variant="h5" fontWeight="bold">Рабочие области</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
                    Создать рабочую область
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Название</TableCell>
                            <TableCell>Поддомен</TableCell>
                            <TableCell>Администратор</TableCell>
                            <TableCell>Пользователи</TableCell>
                            <TableCell>Действия</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {workspaces.map((w) => (
                            <TableRow key={w.id}>
                                <TableCell>{w.name}</TableCell>
                                <TableCell>{w.slug}</TableCell>
                                <TableCell>{w.admin?.name} {w.admin?.last_name}</TableCell>
                                <TableCell>
                                    {w.users?.map((u) => (
                                        <Chip key={u.id} label={`${u.last_name || ""} ${u.name || ""}`.trim()}
                                            size="small" sx={{ mr: 0.5 }} />
                                    ))}
                                </TableCell>
                                <TableCell>
                                    <IconButton color="primary"
                                        onClick={() => navigate(`/workspaces/${w.id}/projects`)}>
                                        <FolderOpenIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleOpen(w)}><EditIcon /></IconButton>
                                    <IconButton color="error" onClick={() => handleDelete(w.id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editId ? "Редактировать рабочую область" : "Создать рабочую область"}</DialogTitle>
                <DialogContent>
                    <TextField label="Название" fullWidth value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })} sx={{ mt: 2, mb: 2 }} />
                    <TextField label="Поддомен (slug)" fullWidth value={form.slug}
                        onChange={(e) => setForm({ ...form, slug: e.target.value })} sx={{ mb: 2 }}
                        helperText="Например: workspace1" />
                    <FormControl fullWidth>
                        <InputLabel>Администратор</InputLabel>
                        <Select value={form.admin_id} label="Администратор"
                            onChange={(e) => setForm({ ...form, admin_id: e.target.value })}>
                            {users.map((u) => (
                                <MenuItem key={u.id} value={u.id}>
                                    {getUserName(u)} — {u.email}
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