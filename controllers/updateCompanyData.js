const User = require('../models/user');
const { validationResult } = require('express-validator');

exports.updateCompanyData = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const {
        companyName,
        companyCif,
        companyAddress,
        companyStreet,
        companyNumber,
        companyPostal,
        companyCity,
        companyProvince,
        isAutonomous
    } = req.body.company;

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const cifPattern = /^[A-Z0-9]{9}$/;

        if (isAutonomous) {
            if (!companyName || !companyCif) {
                return res.status(400).json({ message: 'Para usuarios autónomos, el nombre y CIF de la empresa son obligatorios' });
            }

            if (!cifPattern.test(companyCif)) {
                return res.status(400).json({ message: 'El CIF no tiene un formato válido' });
            }

            // Copiar datos de empresa a datos personales
            user.firstName = companyName;
            user.lastName = '';
            user.nif = companyCif;
        }

        // Validación común si no es autónomo o para datos de empresa
        if (!companyName || !companyCif || !companyAddress || !companyStreet || !companyNumber || !companyPostal || !companyCity || !companyProvince) {
            return res.status(400).json({ message: 'Todos los campos de la compañía son requeridos' });
        }

        if (!cifPattern.test(companyCif)) {
            return res.status(400).json({ message: 'El CIF no tiene un formato válido' });
        }

        // Actualizar datos de la compañía
        user.companyName = companyName;
        user.companyCif = companyCif;
        user.companyAddress = companyAddress;
        user.companyStreet = companyStreet;
        user.companyNumber = companyNumber;
        user.companyPostal = companyPostal;
        user.companyCity = companyCity;
        user.companyProvince = companyProvince;

        await user.save();

        res.status(200).json({ message: 'Datos de la compañía actualizados correctamente', user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error al actualizar los datos de la compañía' });
    }
};