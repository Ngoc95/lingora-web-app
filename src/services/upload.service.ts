import { api } from "./api";

export const uploadService = {
    uploadImage: async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await api.post<any>("/uploads/image", formData);
        return response;
    },
};
