import axios from "../api/axios";

const USERS_ENDPOINT = '/api/v1/users?register';

export const postData = async (formData: any): Promise<{ success: boolean; message: string; }> => {
  try {
    const response = await axios.post(USERS_ENDPOINT,
        JSON.stringify(formData),
        {
            headers: { 'Content-Type': 'application/json' },
        }
    );
    return { success: true, message: response.statusText };
  } catch (err: any) {
      if (!err.response) {
        return { success: false, message: "No server response"}
      }
      const { error_message, existing_data, invalid_data } = err.response.data;
      let messageParts: string[] = [];

      if (error_message) {
        messageParts.push(error_message);
      }

      if (existing_data && Object.keys(existing_data).length > 0) {
        Object.values(existing_data).forEach((value: any) => {
          messageParts.push(value + ' exists in the database');
        });
      }

      if (invalid_data && Object.keys(invalid_data).length > 0) {
        Object.values(invalid_data).forEach((value: any) => {
          messageParts.push(value);
        });
      }

      const finalMessage = messageParts.join(' | ');
      return { success: false, message: finalMessage };
    
    }
};