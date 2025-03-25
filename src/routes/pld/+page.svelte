<script lang='ts'>
    import { createGrid } from 'ag-grid-community';
    import type { GridApi, GridOptions } from "ag-grid-community";
    import "$lib/styles/ag-grid-theme-builder.css"
    import { onMount } from 'svelte';
    import {Button} from '$lib/components/ui/button';
    import type { PageData } from '../pld/$types';
    
    let gridApi: GridApi | null = null;
    export let data: PageData;
    
    let selectedRows:any = []
    
    function getRows(){
        selectedRows = gridApi?.getSelectedRows();
        console.log(selectedRows)
    }
    
    
    onMount(async()=>{
        console.log(data)
    let gridOptions: GridOptions = {
        columnDefs: [
            { headerName: "Reference",headerCheckboxSelection: true, checkboxSelection: true, field: "reference", filter: true, floatingFilter: true, filterParams: { buttons: ["apply", "reset"], closeOnApply: true }},
            { headerName: "Organization", field: "orgName", filter: true, floatingFilter: true, filterParams: { buttons: ["apply", "reset"], closeOnApply: true }},
            { headerName: "Customer", field: "customerName", filter: true, floatingFilter: true, filterParams: { buttons: ["apply", "reset"], closeOnApply: true }},
        ],
        pagination: true,
        paginationPageSize: 20,
        rowData: data.pld.data,
        rowSelection: 'multiple',
        rowMultiSelectWithClick: true,
        domLayout: 'autoHeight',
    };
    let eGridDiv = document.querySelector("#myGrid") as HTMLElement;
    eGridDiv.style.setProperty('width', '100%')
    gridApi = createGrid(eGridDiv, gridOptions);
    
    })
    
    
    
    </script>
    <div>
    
    
    <div class='flex justify-between'>
    <h2
    class="scroll-m-20 text-3xl font-semibold tracking-tight mb-4"
    >PLD</h2>
    <div class="flex justify-end">
        <Button on:click={getRows} >Save</Button>
    </div>
    </div>
    <div id="myGrid" class="ag-theme-custom mb-10" style="width:100%; height:1000px"></div>
    
    </div>