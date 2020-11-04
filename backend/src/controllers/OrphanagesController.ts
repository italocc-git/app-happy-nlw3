import {Request,Response} from 'express'
import {getRepository} from 'typeorm';
import Orphanage from '../models/Orphanage'
import orphanageView from '../views/Orphanages_view'
import * as Yup from 'yup';

export default {
    async index(request:Request,response:Response){
        const orphanagesRepository = getRepository(Orphanage);

        const orphanages = await orphanagesRepository.find({
            relations : ['images'] /* name of the field images on the insomnia */
        }); /* to list all orphanages */

        return response.json(orphanageView.renderMany(orphanages));
    },
    async show(request:Request,response:Response){
        const {id} = request.params;
        const orphanagesRepository = getRepository(Orphanage);

        const orphanage = await orphanagesRepository.findOneOrFail(id, {
            relations: ['images']
        }); /* to list a specific orphanage */

        return response.json(orphanageView.render(orphanage));
    },
    async create(request:Request,response:Response){
        
            const {name,
                latitude,
                longitude,
                about,
                instructions,
                opening_hours,
                open_on_weekends}= request.body;
            
                const orphanagesRepository = getRepository(Orphanage);
                
                const requestImages = request.files as Express.Multer.File[]; /* forcing the type of  files array */

                const images = requestImages.map(image => {
                    return {path: image.filename} /*  the only information that Images has */
                })
                
                const data = {
                    name,
                    latitude,
                    longitude,
                    about,
                    instructions,
                    opening_hours,
                    open_on_weekends,
                    images
                    
                }

                const schema = Yup.object().shape({
                    name: Yup.string().required('Name required! You must to filled'),
                    latitude : Yup.number().required(),
                    longitude : Yup.number().required(),
                    about : Yup.string().required().max(300),
                    instructions : Yup.string().required(),
                    opening_hours: Yup.string().required(),
                    open_on_weekends : Yup.boolean().required(),
                    images : Yup.array(
                        Yup.object().shape({
                            path: Yup.string().required()
                        })
                    )
                })

                await schema.validate(data, { abortEarly : false});

                const orphanage = orphanagesRepository.create(data)
                await orphanagesRepository.save(orphanage)
                
            return response.status(201).json(orphanage)
    }
}