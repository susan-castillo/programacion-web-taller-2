const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

// Endpoint con parámetro en la URL
app.get('/api/calculo/:monto', (req, res) => {
    try {
        const { monto } = req.params;
        const salario = Number(monto);

        // Validación: que sea numérico y estrictamente mayor a 0
        if (isNaN(salario) || salario <= 0) {
            return res.status(400).json({
                error: "El salario debe ser un número mayor a cero"
            });
        }

        // Cálculos para El Salvador (IVA 13%, Renta 10%)
        const iva = salario * 0.13;
        const renta = salario * 0.10;

        return res.json({
            monto: salario,
            iva: Number(iva.toFixed(2)),
            renta: Number(renta.toFixed(2))
        });

    } catch (error) {
        return res.status(500).json({
            error: "Error interno del servidor",
            detalle: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Ejercicio 1 corriendo en http://localhost:${PORT}`);
});