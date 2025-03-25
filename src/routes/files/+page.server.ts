import type { PageLoad } from "../$types";
import config from "$lib/config";
export const load: PageLoad = async ({ params }) => {
    const baseURL: string = config.API_URL
    const url:string = `${baseURL}/api/v1/shiphero/bills`
    const response = await fetch(url)
    const data = await response.json()  
    console.log(data)
    return {
        bills: data
    }
};