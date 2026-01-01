let allCoins = []; 

const ApiData = async () => {
    try {
        const url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&sparkline=true&price_change_percentage=1h,24h,7d";
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);
        
        const currentData = await response.json();
        allCoins = currentData; 

        const searchInp = document.querySelector("#search-inp");
        if (searchInp.value === "") {
            RenderTableBody(currentData);
        }

    } catch (error) {
        console.error("Fetching failed:", error.message);
    }
};

const RenderTableBody = (data) => {
    const tablebody = document.querySelector("#coinTableBody");
    
    if (!data || data.length === 0) {
        tablebody.innerHTML = `<tr><td colspan="10" style="text-align:center; color:white; padding: 20px;">No Coins Found</td></tr>`;
        return;
    }

    const rows = data.map((coin, index) => {
        const {
            name, symbol, current_price, market_cap, image,
            price_change_percentage_1h_in_currency,
            price_change_percentage_24h_in_currency,
            price_change_percentage_7d_in_currency,
            price_change_24h,
            sparkline_in_7d,
            total_volume
        } = coin;

        const formatPercent = (val) => {
            if (val == null) return "<td>-</td>";
            const color = val > 0 ? '#10b981' : '#ef4444';
            return `<td style="color: ${color}; font-weight: 500;">${val.toFixed(2)}%</td>`;
        };

        // Sparkline Logic
        let sparklineSVG = "";
        if (sparkline_in_7d?.price) {
            const prices = sparkline_in_7d.price;
            const min = Math.min(...prices);
            const max = Math.max(...prices);
            const points = prices.map((p, i) => {
                const x = (i / (prices.length - 1)) * 100;
                const y = 30 - ((p - min) / (max - min)) * 30;
                return `${x},${y}`;
            }).join(' ');
            const chartColor = price_change_percentage_7d_in_currency > 0 ? '#10b981' : '#ef4444';
            sparklineSVG = `<svg width="100" height="30"><polyline fill="none" stroke="${chartColor}" stroke-width="1.5" points="${points}" /></svg>`;
        }

        return `
            <tr>
                <td>${index + 1}</td>
                <td class="image-coin coin-name">

                      <div class="imageee">

                      <img src="${image}" width="20" style="margin-right: 10px;">

                    </div>

                   <div class="div-name"><p> ${name} </p><span style="color: gray; font-size: 0.8rem;">${symbol.toUpperCase()}</span></div>

                </td>
                <td style="font-weight: bold;">$${current_price.toLocaleString()}</td>
                ${formatPercent(price_change_percentage_1h_in_currency)}
                ${formatPercent(price_change_percentage_24h_in_currency)}
                ${formatPercent(price_change_percentage_7d_in_currency)}
                <td style="color: ${price_change_24h > 0 ? '#10b981' : '#ef4444'}">
                    $${total_volume.toLocaleString()}
                </td>
                <td>$${market_cap.toLocaleString()}</td>
                <td>${sparklineSVG}</td>
            </tr>
        `;
    }).join('');

    tablebody.innerHTML = rows;
};



const searchInp = document.querySelector("#search-inp");
searchInp.addEventListener("input", () => {
    const searchValue = searchInp.value.toLowerCase();
    const filteredCoins = allCoins.filter(coin => {
        return coin.name.toLowerCase().includes(searchValue) || 
               coin.symbol.toLowerCase().includes(searchValue);
    });
    
    RenderTableBody(filteredCoins);
});


const sortOption = document.querySelector("#sortOption");
sortOption.addEventListener("change", () => {
    const value = sortOption.value;
    let sortedData = [...allCoins];
    switch (value) {
        case "market_cap":
            sortedData.sort((a, b) => b.market_cap - a.market_cap);
            break;

        case "price_high":
            sortedData.sort((a, b) => b.current_price - a.current_price);
            break;

        case "price_low":
            sortedData.sort((a, b) => a.current_price - b.current_price);
            break;

        case "change":
            sortedData.sort((a, b) => b.price_change_percentage_24h_in_currency - a.price_change_percentage_24h_in_currency);
            break;

        default:
            break;
    }
    RenderTableBody(sortedData);
});




ApiData();
setInterval(ApiData, 30000);