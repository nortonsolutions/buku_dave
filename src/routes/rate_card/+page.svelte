<script lang="ts">
    // Sample data - in real app this would come from API
    let rateData: Rate[] = [
      { id: 'a1', weight: 15, zone: '1', rate: 4.50, client_rate: 4.59, margin: 0.09 },
      { id: 'a2', weight: 15, zone: '2', rate: 4.75, client_rate: 4.84, margin: 0.09 },
      { id: 'a3', weight: 15, zone: '3', rate: 5.00, client_rate: 5.09, margin: 0.09 },
      { id: 'b1', weight: 16, zone: '1', rate: 4.65, client_rate: 4.74, margin: 0.09 },
      { id: 'b2', weight: 16, zone: '2', rate: 4.89, client_rate: 4.99, margin: 0.10 },
      { id: 'b3', weight: 16, zone: '3', rate: 5.15, client_rate: 5.25, margin: 0.10 },
      { id: 'c1', weight: 17, zone: '1', rate: 4.80, client_rate: 4.89, margin: 0.09 },
      { id: 'c2', weight: 17, zone: '2', rate: 5.05, client_rate: 5.15, margin: 0.10 },
      { id: 'c3', weight: 17, zone: '3', rate: 5.30, client_rate: 5.40, margin: 0.10 },
      { id: 'd1', weight: 18, zone: '1', rate: 4.95, client_rate: 5.05, margin: 0.10 },
      { id: 'd2', weight: 18, zone: '2', rate: 5.21, client_rate: 5.31, margin: 0.10 },
      { id: 'd3', weight: 18, zone: '3', rate: 5.45, client_rate: 5.55, margin: 0.10 },
    ];
 
    let search = 'weight';
    interface Rate{
      id: string;
      weight: number;
      zone: string;
      rate: number;
      client_rate: number;
      margin: number;
    };

    interface RateLookup {
    [key: string]: {
      rate: number | string;
      id: string | null;
      client_rate: number | string;
      margin: number | string;
    };
  }

    // Process data to get unique weights and zones
    $: weights = [...new Set(rateData.map(item => item.weight))].sort((a, b) => Number(a) - Number(b));
    $: zones = [...new Set(rateData.map(item => item.zone))].sort((a, b) => Number(a) - Number(b));
    
    // Create lookup table for rates
    $: rateLookup = rateData.reduce<RateLookup>((acc, item: Rate) => {
      acc[`${item.weight}-${item.zone}`] = { 
        rate: item.rate, 
        id: item.id,
        client_rate: item.client_rate,
        margin: item.margin 
      };
      return acc;
    }, {});

    function updateRate(id:string, newRate: number) {
      rateData = rateData.map(item => item.id === id ? { ...item, rate: newRate } : item);
    }
  
    // Function to get rate info for a weight-zone combination
    function getRateInfo(weight: Number, zone: string) {
      return rateLookup[`${weight}-${zone}`] || { rate: '-', id: null };
    }
  
    // Example of how to fetch data
    async function fetchRates() {
      try {
        const response = await fetch('/api/rates');
        rateData = await response.json();
      } catch (error) {
        console.error('Error fetching rates:', error);
      }
    }
  
    // Uncomment to fetch on mount
    // onMount(fetchRates);
  </script>
  
  <style>
    .rate-table {
      border-collapse: collapse;
      font-family: system-ui, -apple-system, sans-serif;
      margin: 1rem;
    }
  
    th, td {
      border: 1px solid #e5e7eb;
      padding: 0.75rem;
      text-align: center;
    }
  
    th {
      background-color: #000000;
    }
  
    .weight-cell {
      font-weight: 600;
      background-color: #000000;
    }
  
    td:hover {
      background-color: #f9fafb;
      color: #000000
    }
  
    .rate-cell {
      color: #ffffff;
    }
  </style>
  
  <div>
    <select bind:value={search}>
      <option value="weight">Weight</option>
      <option value="zone">Zone</option>
    </select>
    <table class="rate-table">
      <thead>
        <tr>
          <th>Weight (lbs)</th>
          {#each zones as zone}
            <th>{zone}</th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each weights as weight}
          <tr>
            <td class="weight-cell">{weight}</td>
            {#each zones as zone}
              {@const rateInfo = getRateInfo(weight, zone)}
              <td 
                class="rate-cell"
                id={rateInfo.id}
              >
                <div>
                  <span style="color: white">{typeof rateInfo.rate === 'number' ? rateInfo.rate.toFixed(2) : rateInfo.rate}</span>
                <span style="color: green">{typeof rateInfo.client_rate === 'number' ? rateInfo.client_rate.toFixed(2) : rateInfo.client_rate}</span>
                <span style="color: white">{typeof rateInfo.margin === 'number' ? rateInfo.margin.toFixed(2) : rateInfo.margin}</span></div>
              </td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>