import { useState, useEffect } from "react";
import api from "../services/api";
import {
    Box, Button, Typography, TextField, Paper,
    Alert, CircularProgress, Divider
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import UploadIcon from "@mui/icons-material/Upload";

const emptyForm = {
    company_name: "", director_full_name: "",
    director_position: "", phone: "", email: ""
};

export default function Settings() {
    const [form, setForm] = useState(emptyForm);
    const [logo, setLogo] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => { fetchSettings(); }, []);

    const fetchSettings = async () => {
        try {
            const res = await api.get("/settings");
            if (res.data) {
                setForm({
                    company_name: res.data.company_name || "",
                    director_full_name: res.data.director_full_name || "",
                    director_position: res.data.director_position || "",
                    phone: res.data.phone || "",
                    email: res.data.email || "",
                });
                if (res.data.logo_path) {
                    setLogoPreview(`/storage/${res.data.logo_path}`);
                }
            }
        } catch {
            setError("Ошибка загрузки настроек");
        } finally {
            setLoading(false);
        }
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogo(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setSuccess(false);
        setError("");
        try {
            const formData = new FormData();
            formData.append("company_name", form.company_name);
            formData.append("director_full_name", form.director_full_name);
            formData.append("director_position", form.director_position);
            formData.append("phone", form.phone);
            formData.append("email", form.email);
            if (logo) {
                formData.append("logo", logo);
            }

            await api.post("/settings", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setSuccess(true);
        } catch {
            setError("Ошибка сохранения");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <CircularProgress />;

    return (
        <Box maxWidth={600}>
            <Typography variant="h5" fontWeight="bold" mb={3}>
                Настройки системы
            </Typography>

            {success && <Alert severity="success" sx={{ mb: 2 }}>Настройки сохранены!</Alert>}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Paper sx={{ p: 3 }}>
                <Typography variant="h6" mb={2}>Информация о компании</Typography>
                <Divider sx={{ mb: 2 }} />

                {/* Логотип */}
                <Box mb={3}>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                        Логотип компании
                    </Typography>
                    {logoPreview && (
                        <Box mb={2}>
                            <img src={logoPreview} alt="Логотип"
                                style={{ maxHeight: 100, maxWidth: 300, objectFit: "contain" }} />
                        </Box>
                    )}
                    <Button variant="outlined" component="label" startIcon={<UploadIcon />}>
                        Загрузить логотип
                        <input type="file" hidden accept="image/*" onChange={handleLogoChange} />
                    </Button>
                </Box>

                <Divider sx={{ mb: 2 }} />

                <TextField label="Название компании" fullWidth value={form.company_name}
                    onChange={(e) => setForm({ ...form, company_name: e.target.value })} sx={{ mb: 2 }} />
                <TextField label="ФИО руководителя" fullWidth value={form.director_full_name}
                    onChange={(e) => setForm({ ...form, director_full_name: e.target.value })} sx={{ mb: 2 }} />
                <TextField label="Должность руководителя" fullWidth value={form.director_position}
                    onChange={(e) => setForm({ ...form, director_position: e.target.value })} sx={{ mb: 2 }} />
                <TextField label="Контактный телефон" fullWidth value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })} sx={{ mb: 2 }} />
                <TextField label="Контактный email" fullWidth value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })} sx={{ mb: 3 }} />

                <Button variant="contained" startIcon={<SaveIcon />}
                    onClick={handleSave} disabled={saving} size="large">
                    {saving ? "Сохранение..." : "Сохранить"}
                </Button>
            </Paper>
        </Box>
    );
}