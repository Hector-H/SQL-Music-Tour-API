const bands = require('express').Router();
const db = require('../models');
const { Op } = require('sequelize');
const { Band, MeetGreet, Event, SetTime } = db;

bands.get('/', async (req, res) => {
    const { name = '', limit=5, offset=0 } = req.query;
    try {
        const foundBands = await Band.findAll({
            order: [['available_start_time', 'ASC' ], [ 'name', 'ASC']],
            where: {
                name: {
                    [Op.iLike] : `%${name}%`
                }
            },
            limit,
            offset
        });
        res.status(200).json(foundBands);
    } catch (e) {
        res.status(500).json(e);
    }
});

bands.get('/:name', async (req, res) => {
    const { event: eventName = '' } = req.query;

    const where = {
        name: {
            [Op.iLike] : `%${eventName}%`
        }
    }
    try {
        const foundBand = await Band.findOne({
            attributes: {
                exclude: 'band_id'
            },
            where: {
                name: {
                    [Op.iLike] : `%${req.params.name}%`
                }
            },
            include: [
                {
                    model: MeetGreet,
                    as: 'meetGreets',
                    attributes: {
                        exclude: ['meet_greet_id', 'event_id', 'band_id']
                    },
                    include: {
                        model: Event, 
                        attributes: {
                            exclude: ['event_id']
                        },
                        as: 'event',
                        where
                    }
                },
                {
                    model: SetTime,
                    as: 'setTimes',
                    attributes: {
                        exclude: ['set_time_id', 'event_id', 'band_id', 'stage_id']
                    },
                    include: {
                        model: Event,
                        attributes: {
                            exclude: ['event_id']
                        },
                        as: 'event',
                        where
                    }
                }
            ],
            order: [
                [{ model: MeetGreet, as: 'meetGreets'}, { model: Event, as: 'event'}, 'date', 'ASC'],
                [{ model: SetTime, as: 'setTimes'}, { model: Event, as: 'event'}, 'date', 'ASC'],
            ]
        });
        
        res.status(200).json(foundBand);
    } catch(e) {
        console.log(e)
        res.status(500).json(e)
    }
})

bands.post('/', async (req, res) => {
    try {
        const newBand = await Band.create(req.body);
        res.status(200).json({
            message: 'Successfully created a band',
            data: newBand
        });
    } catch (error) {
        res.status(500).json(error);
    }
})

bands.put('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const updatedBand = await Band.update(req.body, {
            where: {
                band_id: id
            }
        });
        res.status(200).json({
            message: `successfully updated the band`,
            updatedBand
        });
    } catch (error) {
        res.status(500).json(error);
    }
});

bands.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deletedBand = await Band.destroy({
            where: {
                band_id: id
            }
        })
        res.status(200).json({
            message: `Successfully yeeted band id: ${id}`
        })
    } catch (error) {
        res.status(500).json(error);
    }
})

module.exports = bands;