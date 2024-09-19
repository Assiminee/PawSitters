import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';

// Define the path to the data file
const filePath = path.join(__dirname, 'data.json');

// Function to make a POST request
const postRequest = (path: string, data: any, callback: (responseBody: string) => void) => {
    const options: http.RequestOptions = {
        hostname: 'localhost',
        port: 8081,
        path: path,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(JSON.stringify(data)),
        }
    };

    const req = http.request(options, (res) => {
        let responseBody = '';

        res.on('data', (chunk) => {
            responseBody += chunk;
        });

        res.on('end', () => {
            callback(responseBody);
        });
    });

    req.on('error', (e) => {
        console.error('Request error:', e);
    });

    req.write(JSON.stringify(data));
    req.end();
};

// Function to create users from the data file
export const createUsers = () => {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return;
        }

        const jsonData = JSON.parse(data);
        const root = '/api/v1/users';

        if ('users' in jsonData) {
            for (const user of jsonData.users) {
                let address: object;
                let pets: [];

                if ('address' in user) {
                    address = user.address;
                    delete user.address;
                }
                if ('pets' in user) {
                    pets = user.pets;
                    delete user.pets;
                }

                postRequest(`${root}?register`, user, (responseBody) => {
                    const response = JSON.parse(responseBody);
                    const userId = response.id;

                    if (address) {
                        postRequest(`${root}/${userId}/address`, address, (addressResponseBody) => {
                            console.log('Address creation response:', addressResponseBody);
                        });
                    }

                    if (pets && pets.length > 0) {
                        for (const pet of pets) {
                            postRequest(`${root}/${userId}/pets`, pet, (petResponseBody) => {
                                console.log('Pet creation response:', petResponseBody);
                            });
                        }
                    }
                });
            }
        }
    })
}