import {Router} from 'express';
import {UserController} from "../controllers/user.controller";
import {ensureJsonContentType, resData, upload, uploads, validateBody} from "./helperFunctions";
import {PetController} from "../controllers/pet.controller";

// Type definitions for route parameters
type UserParam = { user_id: string };
type MergedParams = UserParam & {pet_id: string};

// Create a router instance with parameter merging enabled
const petRouter = Router({mergeParams: true});

/**
 * Route handler for getting all pets of a specific user.
 *
 * - Retrieves pets associated with the user specified by `user_id`.
 * - Returns a 200 status code with the pets data if successful.
 * - Returns an error response if an error occurs.
 *
 * @param {Request<UserParam>} req - The HTTP request object containing `user_id` parameter.
 * @param {Response} res - The HTTP response object.
 */
petRouter.get<'/', UserParam>('/', async (req, res) => {
    try {
        const pets = await (new PetController())
            .findPets(req.params.user_id)

        res.status(200).json(pets);
    } catch (err) {
        const [code, json] = resData(err);
        res.status(code).json(json);
    }
});

/**
 * Route handler for getting a specific pet by ID.
 *
 * - Retrieves pet details by `pet_id` and `user_id`.
 * - Returns a 200 status code with the pet data if successful.
 * - Returns an error response if an error occurs.
 *
 * @param {Request<MergedParams>} req - The HTTP request object containing `pet_id` and `user_id` parameters.
 * @param {Response} res - The HTTP response object.
 */
petRouter.get<'/:pet_id', MergedParams>('/:pet_id', async (req , res) => {
    try {
        const controller = new PetController();
        const pet = await controller.findPetById(
            req.params.pet_id, req.params.user_id
        );

        res.status(200).json(controller.getPetData(pet));
    } catch (err) {
        const [code, json] = resData(err);
        res.status(code).json(json);
    }
})

/**
 * Route handler for creating a new pet.
 *
 * - Validates the request body and creates a pet for the user specified by `user_id`.
 * - Returns a 201 status code with the created pet data if successful.
 * - Returns an error response if an error occurs.
 *
 * @param {Request<UserParam>} req - The HTTP request object containing `user_id` parameter and pet data in the body.
 * @param {Response} res - The HTTP response object.
 */
petRouter.post<'/', UserParam>('/', ensureJsonContentType, async (req, res) => {
    try {
        const user = await (new UserController())
            .getEntityById(req.params.user_id, ['pets', 'pets.user', 'pets.breed', 'role']);
        const pet = await (new PetController())
            .createPet(validateBody({...req.body}), user);

        res.status(201).json(pet);
    } catch (err) {
        const [code, json] = resData(err);
        res.status(code).json(json);
    }
});

/**
 * Route handler for uploading an image for a specific pet.
 *
 * - Uses multer to handle file uploads.
 * - Updates the pet's image path with the uploaded file.
 * - Removes the old image if it exists.
 * - Returns a 200 status code with the updated pet data if successful.
 * - Returns a 400 status code if no file is uploaded or an error occurs.
 *
 * @param {Request<MergedParams>} req - The HTTP request object containing `pet_id` and `user_id` parameters, and file upload.
 * @param {Response} res - The HTTP response object.
 */
petRouter.post<'/:pet_id/image', MergedParams>('/:pet_id/image', upload.single('pet_image'), async (req, res) => {
    try {
        const controller = new PetController();
        const pet = await controller.findPetById(
            req.params.pet_id, req.params.user_id
        );

        if (!req.file)
            return res.status(400).json({
                message: 'No file uploaded. Please upload a valid image.'
            });

        controller.removeImage(
            pet.image_path ?
                uploads + pet.image_path.substring(pet.image_path.lastIndexOf('/')) :
                null
        );

        pet.image_path = 'localhost:8081/public/uploads/' + req.file.filename;
        const savedPet = await controller.repository.save(pet);

        res.status(200).json(controller.getPetData(savedPet));
    } catch (err) {
        console.error(req.body);
        const [code, json] = resData(err);
        res.status(code).json(json);
    }
});

/**
 * Route handler for updating a specific pet.
 *
 * - Validates the request body and updates pet details for the specified `pet_id` and `user_id`.
 * - Returns a 200 status code with the updated pet data if successful.
 * - Returns an error response if an error occurs.
 *
 * @param {Request<MergedParams>} req - The HTTP request object containing `pet_id` and `user_id` parameters, and updated pet data in the body.
 * @param {Response} res - The HTTP response object.
 */
petRouter.put<'/:pet_id', MergedParams>('/:pet_id', ensureJsonContentType, async (req, res) => {
    try {
        const pet = await (new PetController())
            .editPet(validateBody({...req.body}), req.params.user_id, req.params.pet_id);

        res.status(200).json(pet);
    } catch (err) {
        const [code, json] = resData(err);
        res.status(code).json(json);
    }
});

/**
 * Route handler for deleting a specific pet.
 *
 * - Deletes the pet specified by `pet_id` and `user_id`.
 * - Returns a 204 status code if successful.
 * - Returns an error response if an error occurs.
 *
 * @param {Request<MergedParams>} req - The HTTP request object containing `pet_id` and `user_id` parameters.
 * @param {Response} res - The HTTP response object.
 */
petRouter.delete<'/:pet_id', MergedParams>('/:pet_id', ensureJsonContentType, async (req, res) => {
    try {
        await (new PetController()).deletePet(req.params.user_id, req.params.pet_id);

        res.status(204).json();
    } catch (err) {
        const [code, json] = resData(err);
        res.status(code).json(json);
    }
});

export default petRouter;