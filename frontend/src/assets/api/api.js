import axios from "axios"


const API_BASE_URL = 'https://leadflow-fsmawy1q5-kiran-s.vercel.app/api'


const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type":"application/json"
    }
})

// Leads API
export const getLeads = async(params={}) =>{
    const cleanParams = {};
    Object.keys(params).forEach((key) => {
        if(params[key] !== undefined && params[key] !== null && params[key] !== ''){
            cleanParams[key] = params[key]
        }
    })
    const res = await api.get("/leads",{params: cleanParams})
    return res.data
}