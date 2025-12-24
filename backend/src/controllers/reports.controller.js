import Sale from '../models/Sale.js';
import Product from '../models/Product.js';
import Client from '../models/Client.js';
import mongoose from 'mongoose';

// Reporte de ventas por rango de fechas
export const ventasPorFecha = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({ message: 'Las fechas de inicio y fin son requeridas.' });
        }

        const sales = await Sale.find({
            createdAt: {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            },
        }).populate('cliente', 'nombre').populate('usuario', 'nombre');

        res.json(sales);
    } catch (error) {
        res.status(500).json({ message: 'Error al generar el reporte de ventas por fecha.', error: error.message });
    }
};

// Reporte de ventas agrupadas por sección
export const ventasPorSeccion = async (req, res) => {
    try {
        const report = await Sale.aggregate([
            { $unwind: '$items' },
            {
                $lookup: {
                    from: 'products',
                    localField: 'items.producto',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
            { $unwind: '$productDetails' },
            {
                $group: {
                    _id: '$productDetails.seccion',
                    totalVendido: { $sum: '$items.subtotal' },
                    cantidadItems: { $sum: '$items.cantidad' }
                }
            },
            {
                $project: {
                    _id: 0,
                    seccion: '$_id',
                    totalVendido: 1,
                    cantidadItems: 1
                }
            }
        ]);
        res.json(report);
    } catch (error) {
        res.status(500).json({ message: 'Error al generar el reporte de ventas por sección.', error: error.message });
    }
};

// Reporte de productos más vendidos
export const productosMasVendidos = async (req, res) => {
    try {
        const topProducts = await Sale.aggregate([
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.producto',
                    totalVendido: { $sum: '$items.cantidad' }
                }
            },
            { $sort: { totalVendido: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'productInfo'
                }
            },
            { $unwind: '$productInfo' },
            {
                $project: {
                    _id: 0,
                    productoId: '$_id',
                    nombre: '$productInfo.nombre',
                    codigo: '$productInfo.codigo',
                    totalVendido: 1
                }
            }
        ]);
        res.json(topProducts);
    } catch (error) {
        res.status(500).json({ message: 'Error al generar el reporte de productos más vendidos.', error: error.message });
    }
};

// Reporte de cuentas por cobrar (clientes con saldo)
export const cuentasPorCobrar = async (req, res) => {
    try {
        const clients = await Client.find({ saldoActual: { $gt: 0 } })
            .sort({ saldoActual: -1 });
        res.json(clients);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las cuentas por cobrar.', error: error.message });
    }
};

// Reporte de productos con inventario bajo
export const inventarioBajo = async (req, res) => {
    try {
        const products = await Product.find({
            $expr: { $lte: ['$stock', '$stockMinimo'] }
        }).populate('categoria', 'nombre');
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error al generar el reporte de inventario bajo.', error: error.message });
    }
};

// Reporte de resumen de ventas (diario, semanal, mensual)
export const resumenVentas = async (req, res) => {
    try {
        const { period = 'daily' } = req.query; // daily, weekly, monthly
        let format;
        switch (period) {
            case 'weekly':
                format = '%Y-%U'; // Año-Semana
                break;
            case 'monthly':
                format = '%Y-%m'; // Año-Mes
                break;
            default:
                format = '%Y-%m-%d'; // Año-Mes-Día
                break;
        }

        const summary = await Sale.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: format, date: '$createdAt' } },
                    totalVentas: { $sum: '$totales.total' },
                    numeroTransacciones: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } },
            {
                $project: {
                    _id: 0,
                    periodo: '$_id',
                    totalVentas: 1,
                    numeroTransacciones: 1
                }
            }
        ]);

        res.json(summary);
    } catch (error) {
        res.status(500).json({ message: 'Error al generar el resumen de ventas.', error: error.message });
    }
};
