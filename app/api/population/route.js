import { NextResponse } from 'next/server';

export async function GET() {
  // Balanced, absolute JSON dataset URL mapping out recent trend quarters
  const absUrl = "https://abs.gov.au";

  try {
    const response = await fetch(absUrl, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 86400 } // Cache data on Vercel for 24 hours
    });

    if (!response.ok) throw new Error('Failed to fetch from ABS');
    
    const rawData = await response.json();
    
    // 1. Isolate the human-readable date headers
    const timePeriods = rawData.data.structure.dimensions.observation.values.map(v => v.name);
    
    // 2. Isolate the total Australia observation tracking blocks
    const totalAusObservations = rawData.data.dataSets[0].series["0:0:0:3:0"].observations;
    
    // 3. Loop through and map them into a simple, reliable trend lineup
    const cleanData = Object.keys(totalAusObservations).map((key) => {
      const index = parseInt(key, 10);
      const dataValueArray = totalAusObservations[key];
      const rawPopulation = dataValueArray[0]; 
      
      return {
        quarter: timePeriods[index],
        populationInMillions: parseFloat((rawPopulation / 1000000).toFixed(2)), 
        rawPopulation: rawPopulation
      };
    });

    // Sort chronologically from past to present for the line graph
    return NextResponse.json(cleanData.reverse());

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
