import type { PageLoad } from "../$types";
import config from "$lib/config";

export const load: PageLoad = async ({ params }) => {
    try {
        const url = `${config.AVS_URL}/orders/avs`
        const response = await fetch(url)
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json()
        return {
            orders: data,
            avsUrl: config.AVS_URL
        }
    } catch (error) {
        console.error('Failed to fetch orders:', error);
        return {
            orders: [],
            avsUrl: config.AVS_URL
        }
    }
};