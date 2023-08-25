const stages = require('express').Router();
const db = require('../models');
const { Op } = require('sequelize');
const { Stage, Event } = db;

stages.get('/', async(req, res) => {
    try {
        const { name = '', limit=5, offset=0 } = req.query;
        const foundStage = await Stage.findAll({
            where: {
                name: {
                    [Op.iLike]: `%${name}%`
                }
            },
            order: [
                ['capacity', 'DESC'],
                ['manager', 'ASC']
            ],
            limit,
            offset
        });
        res.status(200).json(foundStage);
    } catch (error) {
        res.status(500).json(error);
    }
})

stages.get('/:name', async (req, res) => {
    const { name: stageName = '' } = req.params;
    try {
        console.log(stageName)
        const foundStage = await Stage.findOne({
            attributes: {
                exclude: 'stage_id'
            },
            where: {
                name: {
                    [Op.iLike] : `%${stageName}%`
                }
            },
            include: {
                model: Event,
                as: 'events',
                attributes: {
                    exclude: ['event_id']
                },
                through: {
                    attributes: []
                }
            },
            order: [
                [{
                    model: Event,
                    as: 'events'
                },
                'date',
                'ASC']
            ]
        });
        res.status(200).json(foundStage);
    } catch(e) {
        res.status(500).json(e)
    }
})

stages.post('/', async (req, res) => {
    try {
        const newStage = await Stage.create(req.body);
        res.status(200).json({
            message: 'Successfully created a stage',
            data: newStage
        });
    } catch (error) {
        res.status(500).json(error);
    }
})

stages.put('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const updatedStage = await Stage.update(req.body, {
            where: {
                stage_id: id
            }
        });
        res.status(200).json({
            message: `successfully updated the stage`,
            updatedStage
        });
    } catch (error) {
        res.status(500).json(error);
    }
});

stages.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deletedStage = await Stage.destroy({
            where: {
                stage_id: id
            }
        })
        res.status(200).json({
            message: `Successfully yeeted stage`
        })
    } catch (error) {
        res.status(500).json(error);
    }
})

module.exports = stages;