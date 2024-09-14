import {User} from "../entities/User";
import {AppDataSource} from "../data-source";

const userRepository = AppDataSource.getRepository(User);

export const getUser = async (data: object) => {
    const invalidKeys : string[] = [];
    const columns = AppDataSource.getMetadata(User).propertiesMap;

    for (const key of Object.keys(data)) {
        if (!(key in columns))
            invalidKeys.push(key);
    }

    if (invalidKeys.length > 0)
        return {invalidKeys: invalidKeys};

    return userRepository.findBy(data);
}
