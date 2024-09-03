import {User, Gender, AccountStat} from "./orm/entities/User";
import {BaseRepository} from "./orm/repositories/Base.repository";
import {Pet, PetStatus, Temperament} from "./orm/entities/Pet";
import {AppDataSource} from "./orm/data-source";

export const createUser = async () => {
    const userRepository = new BaseRepository(User);

    const user = await userRepository.saveEntity({
        fname: "Yasmine", lname: "Znatni",
        email: "znatni.yasmine@gmail.com",
        password: "TestPWD001", gender: Gender.F,
        birthday: new Date("1997-10-18"),
        accountStat: AccountStat.P
    });

    console.log(user);

    const pet = await createPet(user as User);

    console.log(pet);

    (user as User).pets = [pet as Pet];


    const rep = AppDataSource.getRepository(User);
    const updatedUser = await rep.save(user as User);

    console.log(updatedUser);
}

const createPet = async (user : User) => {
    const petRepository = new BaseRepository(Pet);

    return petRepository.saveEntity({
        name: "Tayka", birth_date: new Date("2021-10-02"),
        size: 3.5, gender: Gender.F, temperament: Temperament.F,
        description: "Sweet kitty cat", status: PetStatus.A,
        user: user,
    });
}