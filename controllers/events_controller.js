const events = require('express').Router();
const db = require('../models');
const { Op } = require('sequelize');
const { Event, MeetGreet, SetTime, Stage, Band } = db;

events.get('/', async(req, res) => {
    try {
        const { name = '', limit=5, offset=0 } = req.query;
        const foundEvents = await Event.findAll({
            where: {
                name: {
                    [Op.iLike]: `%${name}%`
                }
            },
            order: [
                ['date', 'ASC'],
                ['name', 'ASC']
            ],
            limit,
            offset
        });
        res.status(200).json(foundEvents);
    } catch (error) {
        res.status(500).json(error);
    }
})

events.get('/:name', async (req, res) => {
    const { event: eventName = '' } = req.query;
    try {
        const foundEvent = await Event.findOne({
            attributes: {
                exclude: 'event_id'
            },
            where: {
                name: {
                    [Op.iLike] : `%${eventName}%`
                }
            },
            include: [
                {
                    model: MeetGreet,
                    as: 'meetAndGreets',
                    attributes: {
                        exclude: ['meet_greet_id', 'event_id', 'band_id']
                    },
                    include: {
                        attributes: {
                            exclude: 'band_id'
                        },
                        model: Band,
                        as: 'band'
                    }
                },
                {
                    model: SetTime,
                    as: 'setTimes',
                    attributes: {
                        exclude: ['set_time_id', 'event_id', 'band_id', 'stage_id']
                    },
                    include: [
                        {
                            model: Band,
                            as: 'band',
                            attributes: {
                                exclude: 'band_id'
                            },
                        },
                        {
                            model: Stage,
                            as: 'stage',
                            attributes: {
                                exclude: 'stage_id'
                            },
                        }
                    ]
                },
                {
                    model: Stage,
                    as: 'stages',
                    attributes: {
                        exclude: 'stage_id'
                    },
                    through: {
                        attributes: []
                    }
                }
            ],
            order: [
                [{ model: MeetGreet, as: 'meetAndGreets'}, 'meet_start_time', 'ASC'],
                [{ model: SetTime, as: 'setTimes'}, 'start_time', 'ASC']
            ]
        });
        res.status(200).json(foundEvent);
    } catch(e) {
        console.log(e)
        res.status(500).json(e)
    }
})

events.post('/', async (req, res) => {
    try {
        const newEvent = await Event.create(req.body);
        res.status(200).json({
            message: 'Successfully created a event',
            data: newEvent
        });
    } catch (error) {
        res.status(500).json(error);
    }
})

events.put('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const updatedEvent = await Event.update(req.body, {
            where: {
                event_id: id
            }
        });
        res.status(200).json({
            message: `successfully updated the event`,
            updatedEvent
        });
    } catch (error) {
        res.status(500).json(error);
    }
});

events.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deletedEvent = await Event.destroy({
            where: {
                event_id: id
            }
        })
        res.status(200).json({
            message: `Successfully yeeted band id: ${deletedEvent.name}`
        })
    } catch (error) {
        res.status(500).json(error);
    }
})

module.exports = events;
