const express = require('express');
const app = express();
const PORT = 3001;

app.use(express.json());

const TASAS_POR_PAIS = {
    "elsalvador": { nombre: "elsalvador", iva: 0.13, renta: 0.10 },
    "guatemala":  { nombre: "guatemala",  iva: 0.12, renta: 0.05 },
    "costarica":  { nombre: "costarica",  iva: 0.13, renta: 0.15 },
    "honduras":   { nombre: "honduras",   iva: 0.15, renta: 0.10 },
    "panama":     { nombre: "panama",     iva: 0.07, renta: 0.15 },
    "nicaragua":  { nombre: "nicaragua",  iva: 0.15, renta: 0.10 }
};

function normalizarPais(pais) {
    if (typeof pais !== 'string') return '';
    return pais
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, '');
}

function calcularImpuestos(salarioBruto, tasas) {
    const iva = Number((salarioBruto * tasas.iva).toFixed(2));
    const renta = Number((salarioBruto * tasas.renta).toFixed(2));
    const salarioNeto = Number((salarioBruto - iva - renta).toFixed(2));

    return {
        pais: tasas.nombre,
        salarioBruto: salarioBruto,
        porcentajeIVA: `${Math.round(tasas.iva * 100)}%`,
        porcentajeRenta: `${Math.round(tasas.renta * 100)}%`,
        iva: iva,
        renta: renta,
        salarioNeto: salarioNeto
    };
}

app.post('/api/impuestos', (req, res) => {
    try {
        const { pais, salario } = req.body;

        if (salario === undefined || salario === null || salario === "") {
            return res.status(400).json({ error: "El parámetro 'salario' es obligatorio." });
        }

        const salarioNum = Number(salario);
        if (isNaN(salarioNum) || salarioNum <= 0) {
            return res.status(400).json({ error: "El salario debe ser un número mayor a cero." });
        }

        if (!pais) {
            return res.status(400).json({ error: "El parámetro 'pais' es obligatorio." });
        }

        const clavePais = normalizarPais(pais);
        const configPais = TASAS_POR_PAIS[clavePais];

        if (!configPais) {
            return res.status(400).json({
                error: `El país '${pais}' no es válido o no está soportado.`,
                paisesPermitidos: ["El Salvador", "Guatemala", "Costa Rica", "Honduras", "Panama", "Nicaragua"]
            });
        }

        const resultado = calcularImpuestos(salarioNum, configPais);
        return res.status(200).json(resultado);

    } catch (error) {
        return res.status(500).json({
            error: "Ocurrió un error al procesar el cálculo",
            detalle: error.message
        });
    }
});

app.get('/api/impuestos', (req, res) => {
    try {
        const { pais, salario } = req.query;

        if (!salario || isNaN(Number(salario)) || Number(salario) <= 0) {
            return res.status(400).json({ error: "El salario debe ser un número mayor a cero." });
        }

        if (!pais) {
            return res.status(400).json({ error: "Debe ingresar un país." });
        }

        const clavePais = normalizarPais(pais);
        const configPais = TASAS_POR_PAIS[clavePais];

        if (!configPais) {
            return res.status(400).json({
                error: `País no permitido: '${pais}'.`,
                paisesPermitidos: ["El Salvador", "Guatemala", "Costa Rica", "Honduras", "Panama", "Nicaragua"]
            });
        }

        const resultado = calcularImpuestos(Number(salario), configPais);
        return res.json(resultado);

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Ejercicio 2 corriendo en http://localhost:${PORT}`);
});