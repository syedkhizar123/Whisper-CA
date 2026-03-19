import axios from "axios"

const api = axios.create({
    baseURL: "https://interclub-adelaida-dextrocardial.ngrok-free.dev/api",
    withCredentials: true
})

export default api