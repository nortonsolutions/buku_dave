import type { PageLoad } from "../$types";
import config from "$lib/config";
export const load: PageLoad = async ({ params }) => {
    const baseURL: string = config.API_URL
    const url:string = `${baseURL}/api/v1/pld`
    const response = await fetch(url)
    const data = await response.json()  

    const orgURL:string = `${baseURL}/api/v1/organizations`
    const orgResponse = await fetch(orgURL)
    const orgData = await orgResponse.json()

    const shipperURL:string = `${baseURL}/api/v1/shippers`
    const shipperResponse = await fetch(shipperURL)
    const shipperData = await shipperResponse.json()

    for (let i = 0; i < data.data.length; i++) {
        console.log(data.data[i])
        console.log(orgData.data)
        Object.assign(data.data[i], {orgName: orgData.data.find((org:any) => org.id === data.data[i].organization_id)?.name})
        Object.assign(data.data[i], {customerName: shipperData.data.find((org:any) => org.id === data.data[i].customer_id)?.name})
    }

    return {
        pld: data,
        orgs: orgData
    }
};