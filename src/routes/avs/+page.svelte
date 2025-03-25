<script lang='ts'>
import { createGrid } from 'ag-grid-community';
import type { GridApi, GridOptions } from "ag-grid-community";
import "$lib/styles/ag-grid-theme-builder.css"
import { onMount } from 'svelte';
import {Button} from '$lib/components/ui/button';
import type { PageData } from './$types';

let gridApi: GridApi | null = null;
export let data: PageData;
let tableData = [] 
let selectedRows:any = []

// Add loading states
let isValidating = false;
let isUpdating = false;
let progressCount = 0;
let totalOperations = 0;

async function validateAddresses() {
    selectedRows = gridApi?.getSelectedRows();
    if (!selectedRows?.length) return;

    isValidating = true;
    totalOperations = selectedRows.length;
    progressCount = 0;

    for (let row of selectedRows) {
        const originalAddress = {
            regionCode: row.shipping_address.country,
            postalCode: row.shipping_address.zip,
            administrativeArea: row.shipping_address.state,
            locality: row.shipping_address.city,
            addressLines: [row.shipping_address.address1]
        };

        try {
            const response = await fetch(`${data.avsUrl}/validate/address`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ address: originalAddress })
            });

            if (!response.ok) {
                console.error(`Failed to validate address for row ${row.legacy_id}: ${response.statusText}`);
                continue;
            }

            const validationResponse = await response.json();
            const validatedAddress = validationResponse.result.address.postalAddress;

            if (validatedAddress) {
                const diffs = [];
                const fieldMapping = {
                    regionCode: 'country',
                    postalCode: 'zip',
                    administrativeArea: 'state',
                    locality: 'city',
                    addressLines: 'address1'
                };

                for (const field in fieldMapping) {
                    const originalField = fieldMapping[field];
                    const originalValue = field === 'addressLines' ? originalAddress[field][0] : originalAddress[field];
                    const validatedValue = field === 'addressLines' ? validatedAddress[field][0] : validatedAddress[field];

                    if (originalValue !== validatedValue) {
                        diffs.push({
                            field: originalField,
                            original_value: originalValue,
                            proposed_value: validatedValue
                        });
                    }
                }
                console.log(`${row.legacy_id}`, diffs)
                row.diffs = diffs;
            }

            console.log(`Validation result for row ${row.legacy_id}:`, validationResponse);

            progressCount++;
        } catch (error) {
            console.error(`Error validating address for row ${row.legacy_id}:`, error);
            progressCount++;
        }
    }
    
    gridApi?.refreshCells({ force: true });
    isValidating = false;
    progressCount = 0;
}

async function applyUpdates() {
    selectedRows = gridApi?.getSelectedRows();
    if (!selectedRows?.length) return;

    isUpdating = true;
    totalOperations = selectedRows.length;
    progressCount = 0;

    gridApi?.deselectAll()
    const updatedOrders = new Map(); // Store updated orders by ID

    for (let row of selectedRows) {
        if (!row.diffs || row.diffs.length === 0) {
            progressCount++;
            continue;
        }

        // Create updated address using original address and applying diffs
        const updatedAddress = { ...row.shipping_address };
        
        // Apply each diff to the address
        row.diffs.forEach(diff => {
            updatedAddress[diff.field] = diff.proposed_value;
        });
        gridApi?.applyTransaction({update: [row]})
        try {
            const response = await fetch(`${data.avsUrl}/orders/update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    order_id: row.id,
                    address: updatedAddress
                })
            });

            if (!response.ok) {
                console.error(`Failed to update address for order ${row.legacy_id}: ${response.statusText}`);
                continue;
            }

            const updateResponse = await response.json();
            row.shipping_address = updatedAddress
            row.diffs = []
            gridApi?.applyTransaction({update: [row]})

            console.log(`Update result for order ${row.legacy_id}:`, updateResponse);
            // Store the updated order data
            progressCount++;
        } catch (error) {
            console.error(`Error updating address for order ${row.legacy_id}:`, error);
            progressCount++;
        }
    }
    
    // Update data.orders with the new information
    tableData = tableData.map(order => {
        const updatedOrder = updatedOrders.get(order.id);
        if (updatedOrder) updatedOrder.diffs = []
        return updatedOrder || order;
    });
    isUpdating = false;
    progressCount = 0;
}

// Custom cell renderer function
function diffCellRenderer(params) {
    // Extract the field name from the column definition
    const fieldPath = params.colDef.field;
    const fieldParts = fieldPath.split('.');
    const field = fieldParts[fieldParts.length - 1]; // Get the last part of the field path

    const diffs = params.data.diffs || [];
    const diff = diffs.find(d => d.field === field);

    if (diff) {
        // If a diff is present, highlight the cell and show the proposed value
        return `${params.value} -> <span style="color: green; font-weight: bold;">${diff.proposed_value}</span>`;
    } else {
        // Otherwise, show the original value
        return params.value;
    }
}

onMount(async()=>{
for (let order of data.orders){
    Object.assign(order, {full_name: `${order.shipping_address?.first_name} ${order.shipping_address?.last_name}`})
    Object.assign(order, {diffs: []})
}
let tableData = data.orders
let gridOptions: GridOptions = {
    getRowId: (params) => params.data.id,
    columnDefs: [
        { headerName: "ID", field: "legacy_id", headerCheckboxSelection: true, checkboxSelection: true,filter: true, floatingFilter: true, filterParams: { buttons: ["apply", "reset"], closeOnApply: true }},
        { headerName: "Order Number",  field: "order_number", filter: true, floatingFilter: true, filterParams: { buttons: ["apply", "reset"], closeOnApply: true }},
        { headerName: "Name", field: "full_name", filter: true, floatingFilter: true, filterParams: { buttons: ["apply", "reset"], closeOnApply: true }},
        { headerName: "Company", field: "shipping_address.company", filter: true, floatingFilter: true, filterParams: { buttons: ["apply", "reset"], closeOnApply: true }, editable: true},
        { headerName: "Address 1", field: "shipping_address.address1", filter: true, resizable: true, floatingFilter: true, filterParams: { buttons: ["apply", "reset"], closeOnApply: true }, cellRenderer: diffCellRenderer },
        { headerName: "City", field: "shipping_address.city", filter: true, floatingFilter: true, filterParams: { buttons: ["apply", "reset"], closeOnApply: true }, cellRenderer: diffCellRenderer },
        { headerName: "State", field: "shipping_address.state", filter: true, floatingFilter: true, filterParams: { buttons: ["apply", "reset"], closeOnApply: true }, cellRenderer: diffCellRenderer },
        { headerName: "Zip", field: "shipping_address.zip", filter: true, floatingFilter: true, filterParams: { buttons: ["apply", "reset"], closeOnApply: true }, cellRenderer: diffCellRenderer },
        { headerName: "Country", field: "shipping_address.country", filter: true, floatingFilter: true, filterParams: { buttons: ["apply", "reset"], closeOnApply: true }, cellRenderer: diffCellRenderer },
    ],

    pagination: true,
    paginationPageSize: 20,
    rowData: tableData,
    rowSelection: 'multiple',
    rowMultiSelectWithClick: true,
    domLayout: 'autoHeight',
};
let eGridDiv = document.querySelector("#myGrid") as HTMLElement;
eGridDiv.style.setProperty('width', '100%')
gridApi = createGrid(eGridDiv, gridOptions);

})

$: progressPercentage = totalOperations ? (progressCount / totalOperations) * 100 : 0;

</script>
<div>


<div class='flex justify-between'>
<h3
class="scroll-m-20 text-3xl font-semibold tracking-tight mb-4"
>AVS</h3>



<div class="flex justify-end gap-2 items-center">
    <Button 
        on:click={validateAddresses} 
        disabled={isValidating || isUpdating}
    >
        {#if isValidating}
            Validating... ({progressCount}/{totalOperations})
        {:else}
            Validate
        {/if}
    </Button>
    
    <Button 
        on:click={applyUpdates}
        disabled={isValidating || isUpdating}
    >
        {#if isUpdating}
            Updating... ({progressCount}/{totalOperations})
        {:else}
            Apply Updates
        {/if}
    </Button>
</div>
</div>

{#if isValidating || isUpdating}
    <div class="w-full h-2 bg-gray-200 rounded-full mb-4">
        <div 
            class="h-full bg-blue-600 rounded-full transition-all duration-300" 
            style="width: {progressPercentage}%"
        />
    </div>
{/if}

<div id="myGrid" class="ag-theme-custom mb-10" style="width:100%; height:1000px"></div>

</div>