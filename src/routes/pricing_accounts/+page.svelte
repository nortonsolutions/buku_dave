<script lang='ts'>
    import { createGrid } from 'ag-grid-community';
    import type { GridApi, GridOptions } from "ag-grid-community";
    import "$lib/styles/ag-grid-theme-builder.css"
    import { cn } from "$lib/utils.js";
    import { onMount } from 'svelte';
    import {Button} from '$lib/components/ui/button';
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { Calendar } from "$lib/components/ui/calendar";
    import CalendarIcon from "lucide-svelte/icons/calendar";
    import * as Dialog from "$lib/components/ui/dialog/";
    import * as Popover from "$lib/components/ui/popover"
    import type { PageData } from '../pld/$types';
    import {
    type DateValue,
    DateFormatter,
    getLocalTimeZone,
    parseDate
  } from "@internationalized/date";
    
    let gridApi: GridApi | null = null;
    export let data: PageData;
 
    function updateAndCloseDialog(){
        isEditing = false
    }

    function formatDate(date: string){
        return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    }

    let editingAccount = null
    let isEditing = false 
    const df = new DateFormatter("en-US", {
    dateStyle: "long",
  });
 
  let value: DateValue | undefined = undefined;
 
    
    
    onMount(async()=>{
        console.log(data)
    let gridOptions: GridOptions = {
        columnDefs: [
            { headerName: "AccountName",field: "account_name", filter: true, floatingFilter: true, filterParams: { buttons: ["apply", "reset"], closeOnApply: true }},
            { headerName: "Organization", field: "organization.name", filter: true, floatingFilter: true, filterParams: { buttons: ["apply", "reset"], closeOnApply: true }},
            { headerName: "Year", field: "year", filter: true, floatingFilter: true, filterParams: { buttons: ["apply", "reset"], closeOnApply: true }},
           
        ],
        onCellClicked: (event) => {
            editingAccount = event.data
            isEditing = true
            const dateOnly = editingAccount.effective_date.split('T')[0]
            value = parseDate(dateOnly)
        },
        pagination: true,
        paginationPageSize: 20,
        rowData: data.pricing_accounts.data,
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
    >Pricing Accounts</h2>

    </div>
    <div id="myGrid" class="ag-theme-custom mb-10" style="width:100%; height:1000px; margin:auto"></div>
    

    <Dialog.Root bind:open={isEditing}>
        <Dialog.Trigger
          >Edit Profile</Dialog.Trigger
        >
        <Dialog.Content class="sm:max-w-[425px]">
          <Dialog.Header>
            <Dialog.Title>Edit Pricing Account</Dialog.Title>
            <Dialog.Description>
              Make changes to your pricing account here. 
            </Dialog.Description>
          </Dialog.Header>
          <div class="grid gap-4 py-4">
            {#if editingAccount}
            <div class="grid grid-cols-4 items-center gap-4">
              <Label for="name" class="text-right">Name</Label>
              <Input id="name" value={editingAccount.account_name} class="col-span-3" />
            </div>
            <div class="grid grid-cols-4 items-center gap-4">
              <Label for="username" class="text-right">Organization</Label>
              <Input id="username" value={editingAccount.organization.name} class="col-span-3" />
            </div>
            <div class="grid grid-cols-4 items-center gap-4">
                <Label for="year" class="text-right">Year</Label>
                <Input id="year" value={editingAccount.year} class="col-span-3" />
            </div>
            <div class="grid grid-cols-4 items-center gap-4">
                <Label for="effective_date" class="text-right">Effective Date</Label>
                <Popover.Root openFocus>
                    <Popover.Trigger asChild let:builder>
                      <Button
                        variant="outline"
                        class={cn(
                          "w-[280px] justify-start text-left font-normal",
                          !value && "text-muted-foreground"
                        )}
                        builders={[builder]}
                      >
                        <CalendarIcon class="mr-2 h-4 w-4" />
                        {value ? df.format(value.toDate(getLocalTimeZone())) : "Select a date"}
                      </Button>
                    </Popover.Trigger>
                    <Popover.Content class="w-auto p-0">
                      <Calendar bind:value initialFocus />
                    </Popover.Content>
                  </Popover.Root>
                
            </div>
            {/if}
          </div>
          <Dialog.Footer>
            <Button on:click={updateAndCloseDialog}>Save changes</Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Root>

    </div>