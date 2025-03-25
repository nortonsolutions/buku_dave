<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import { toast } from "svelte-sonner";
    import config from "$lib/config";
    import * as Dialog from "$lib/components/ui/dialog/";
    import { createGrid } from 'ag-grid-community';
    import type { GridApi, GridOptions } from "ag-grid-community";
    import "$lib/styles/ag-grid-theme-builder.css"
    import { onMount } from 'svelte';
    import type { PageData } from "./$types";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";

    // Change type to handle HTML input element
    let fileInput: HTMLInputElement;
    let isUploading = false;
    let error: string | null = null;
    let displayDialog = false;
    let processing = false;
    let gridApi: GridApi | null = null;

export let data: PageData;

let selectedRows:any = []

function getRows(){
    selectedRows = gridApi?.getSelectedRows();
    console.log(selectedRows)
}

function dateRenderer(params: any) {
    const split = params.value.split("T")
    return split[0]
}

async function processSelected(){
    processing = true;
    getRows()
    if (selectedRows.length != 1){
        toast.error("You can only process one bill at a time")
        processing = false;
        return
    }
    const billId = selectedRows[0].id
    const apiURL = config.API_URL;
    const path = `/api/v1/shiphero/bills/process/${billId}`;
    const url = `${apiURL}${path}`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        }
    });

    if (!response.ok) {
        toast.error("Failed to process bill")
        processing = false;
        return
    }
    toast.success("Bill processed successfully")
    processing = false;
}

onMount(async()=>{
let gridOptions: GridOptions = {
    columnDefs: [
        { headerName: "Bill ID",headerCheckboxSelection: true, checkboxSelection: true, field: "id", filter: true, floatingFilter: true, filterParams: { buttons: ["apply", "reset"], closeOnApply: true }},
        { headerName: "Bill Number", field: "bill_number", filter: true, floatingFilter: true, filterParams: { buttons: ["apply", "reset"], closeOnApply: true }},
        { headerName: "Merchant", field: "customer_name", filter: true, floatingFilter: true, filterParams: { buttons: ["apply", "reset"], closeOnApply: true }},
        { headerName: "Original Total", field: "original_charges", filter: true, floatingFilter: true, filterParams: { buttons: ["apply", "reset"], closeOnApply: true }},
        { headerName: "Total Added Charges", field: "total_added_charges", filter: true, floatingFilter: true, filterParams: { buttons: ["apply", "reset"], closeOnApply: true }},
        { headerName: "Invoice Total", field: "total_charges", filter: true, floatingFilter: true, filterParams: { buttons: ["apply", "reset"], closeOnApply: true }},
        { headerName: "Total Rows", field: "row_count", filter: true, floatingFilter: true, filterParams: { buttons: ["apply", "reset"], closeOnApply: true }},
        { headerName: "Period Start", field: "period_start", filter: true, floatingFilter: true, filterParams: { buttons: ["apply", "reset"], closeOnApply: true }, cellRenderer: dateRenderer},
        { headerName: "Period End", field: "period_end", filter: true, floatingFilter: true, filterParams: { buttons: ["apply", "reset"], closeOnApply: true }, cellRenderer: dateRenderer},
        { headerName: "Status", field: "processing_status", filter: true, floatingFilter: true, filterParams: { buttons: ["apply", "reset"], closeOnApply: true }, cellRenderer: dateRenderer}
    ],
    pagination: true,
    paginationPageSize: 100,
    rowData: data.bills,
    rowSelection: 'multiple',
    rowMultiSelectWithClick: true,
    domLayout: 'autoHeight',
    onPaginationChanged: (e) => {
        console.log(e)
    }
};
let eGridDiv = document.querySelector("#myGrid") as HTMLElement;
eGridDiv.style.setProperty('width', '100%')
gridApi = createGrid(eGridDiv, gridOptions);

})

    async function uploadFile(e: Event) {
        try {
            error = null;
            isUploading = true;

            if (!fileInput?.files?.[0]) {
                throw new Error("Please select a file");
            }

            const apiURL = config.API_URL;
            const path = "/api/v1/shiphero/bills/upload";
            const url = `${apiURL}${path}`;

            const formData = new FormData();
            formData.append("file", fileInput.files[0]);

            const response = await fetch(url, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Upload failed");
            }

            // Clear the input after successful upload
            fileInput.value = "";
            toast.success("File uploaded successfully!");
            displayDialog = false;
        } catch (err) {
            if (err instanceof Error) {
                toast.error(err.message);
            } else {
                toast.error("An unknown error occurred");
            }
        } finally {
            displayDialog = false;
            isUploading = false;
        }
    }
</script>

  <Dialog.Root bind:open={processing}>
    <Dialog.Content class="sm:max-w-[425px]">
      <Dialog.Header>
        <Dialog.Title>Processing Bill</Dialog.Title>
        <Dialog.Description>Please wait while the bill is being processed...</Dialog.Description>
      </Dialog.Header>
      <div class="flex justify-center py-4">
        <div class="animate-spin">
          <svg class="w-8 h-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
    </Dialog.Content>
  </Dialog.Root>

<div class="flex justify-between">
  <div class="flex flex-col gap-4 mb-6">
    <h1 class="text-2xl font-semibold tracking-tight">Uptime Customer Bills</h1>
    <p class="text-muted-foreground">View and manage your customer bills and processing status.</p>
</div>



<div class="flex justify-end mb-4">
    <DropdownMenu.Root>
        <DropdownMenu.Trigger>
            <Button variant="outline">Actions</Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
      <DropdownMenu.Group>
        <DropdownMenu.Item on:click={() => {
            displayDialog = true;
        }}>Upload File</DropdownMenu.Item>
        <DropdownMenu.Item on:click={processSelected}>Process Selected</DropdownMenu.Item>
      </DropdownMenu.Group>
    </DropdownMenu.Content>
  </DropdownMenu.Root>
</div>
</div>


<div id="myGrid" class="ag-theme-custom mb-10" style="width:100%; height:1000px"></div>



<Dialog.Root bind:open={displayDialog}>
    <Dialog.Content class="sm:max-w-[425px]">
        <Dialog.Header>
            <Dialog.Title>Upload File</Dialog.Title>
            <Dialog.Description>Upload a ShipHero bill</Dialog.Description>
        </Dialog.Header>
        <div class="grid gap-4 py-4">
            <div class="flex justify-center w-full">
                <div class="flex flex-col gap-1.5">
                    <div class="relative">
                        <input
                            bind:this={fileInput}
                            id="picture"
                            type="file"
                            class="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 w-full"
                            disabled={isUploading}
                        />
                    </div>
                    {#if error}
                        <p class="text-red-500 text-sm mt-2">{error}</p>
                    {/if}
                </div>
            </div>
        </div>
        <Dialog.Footer>
            <Button on:click={uploadFile} disabled={isUploading}>
                {isUploading ? "Uploading..." : "Upload"}
            </Button>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>
