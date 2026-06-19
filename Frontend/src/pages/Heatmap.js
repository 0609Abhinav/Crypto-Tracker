import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMarket } from "../store/marketSlice";
import { useNavigate } from "react-router-dom";
import { formatChange, formatLarge } from "../utils/format";

const GridIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/>
    <rect x="14" y="3" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/>
  </svg>
);

function getColor(change) {
  if (change == null) return "var(--border)";
  if (change >= 10) return "#065f46";
  if (change >= 5) return "#047857";
  if (change >= 2) return "#059669";
  if (change >= 0) return "#10b981";
  if (change >= -2) return "#ef4444";
  if (change >= -5) return "#dc2626";
  if (change >= -10) return "#b91c1c";
  return "#7f1d1d";
}

function HeatmapTile({ coin, size, changeKey }) {

  const navigate = useNavigate();

  const change = coin[changeKey] ?? null;

  const fontSize = size > 120 ? 14 : size > 80 ? 12 : 10;

  const showChange = size > 90;
  const showSymbol = size > 50;
  const showImg = size > 60;
  const showMarketCap = size > 90;


  return (
    <div
      onClick={() => navigate(`/coin/${coin.id}`)}
      title={`${coin.name} (${coin.symbol}): ${
        change != null ? formatChange(change) : "N/A"
      }`}
      style={{
        width: size,
        height: size,
        background: getColor(change),
        borderRadius: 8,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 4,
        transition: "transform 0.15s, opacity 0.15s",
        border: "1px solid rgba(0,0,0,0.25)",
        overflow: "hidden",
        flexShrink: 0,
        position: "relative",
      }}

      onMouseEnter={(e)=>{
        e.currentTarget.style.transform="scale(1.05)";
        e.currentTarget.style.zIndex="10";
        e.currentTarget.style.opacity="0.9";
      }}

      onMouseLeave={(e)=>{
        e.currentTarget.style.transform="scale(1)";
        e.currentTarget.style.zIndex="0";
        e.currentTarget.style.opacity="1";
      }}
    >


      {showImg && coin.image && (
        <img
          src={coin.image}
          alt={coin.name}
          style={{
            width:size > 100 ? 22 : 14,
            height:size > 100 ? 22 : 14,
            borderRadius:"50%",
            marginBottom:3,
            flexShrink:0
          }}

          onError={(e)=>{
            e.target.style.display="none";
          }}
        />
      )}



      {showSymbol && (
        <div
          style={{
            fontSize,
            fontWeight:700,
            color:"#fff",
            textAlign:"center",
            lineHeight:1.2,
            textShadow:"0 1px 3px rgba(0,0,0,0.4)"
          }}
        >
          {coin.symbol}
        </div>
      )}



      {showChange && change != null && (
        <div
          style={{
            fontSize:fontSize-1,
            color:"rgba(255,255,255,0.9)",
            marginTop:2,
            textShadow:"0 1px 2px rgba(0,0,0,0.4)"
          }}
        >
          {formatChange(change)}
        </div>
      )}



      {showMarketCap && coin.market_cap && (
        <div
          style={{
            fontSize:fontSize-2,
            color:"rgba(255,255,255,0.8)",
            marginTop:2,
            textShadow:"0 1px 2px rgba(0,0,0,0.4)"
          }}
        >
          {formatLarge(coin.market_cap)}
        </div>
      )}


    </div>
  );
}


const CHANGE_VIEWS=[
  {key:"change",label:"24h"},
  {key:"change7d",label:"7D"},
];


const SIZE_VIEWS=[
  {key:"cap",label:"By MCap"},
  {key:"equal",label:"Equal"},
];



export default function Heatmap(){

  const dispatch=useDispatch();

  const {coins,loading}=useSelector((s)=>s.market);

  const currency=useSelector((s)=>s.currency.current);


  const [changeKey,setChangeKey]=useState("change");
  const [sizeMode,setSizeMode]=useState("cap");
  const [topN,setTopN]=useState(100);



  useEffect(()=>{
    dispatch(fetchMarket({
      currency:currency.code
    }));
  },[dispatch,currency.code]);



  const sized=coins.slice(0,topN).map((c,i)=>{

    let size;

    if(sizeMode==="equal"){
      size=72;
    }
    else{
      size=i<5?160:
           i<15?120:
           i<30?90:
           i<60?70:52;
    }


    return {
      ...c,
      tileSize:size
    };

  });



  const legend=[
    {label:"> +10%",color:"#065f46"},
    {label:"+5%",color:"#047857"},
    {label:"+2%",color:"#059669"},
    {label:"0%",color:"#10b981"},
    {label:"-2%",color:"#ef4444"},
    {label:"-5%",color:"#dc2626"},
    {label:"-10%",color:"#b91c1c"},
    {label:"< -10%",color:"#7f1d1d"},
  ];



  const positive=coins.filter(
    c=>(c[changeKey] ?? 0)>0
  ).length;


  const negative=coins.filter(
    c=>(c[changeKey] ?? 0)<0
  ).length;



  return (

<div style={{
  maxWidth:1300,
  margin:"0 auto",
  padding:"40px 20px"
}}>


<div style={{
display:"flex",
justifyContent:"space-between",
alignItems:"flex-start",
flexWrap:"wrap",
gap:16,
marginBottom:24
}}>


<div>

<div style={{
display:"flex",
alignItems:"center",
gap:12,
marginBottom:8
}}>

<div style={{
width:40,
height:40,
borderRadius:12,
background:"rgba(99,102,241,0.12)",
border:"1px solid rgba(99,102,241,0.2)",
display:"flex",
alignItems:"center",
justifyContent:"center"
}}>

<GridIcon/>

</div>


<h1 style={{
fontSize:28,
fontWeight:800
}}>
Market Heatmap
</h1>


</div>


<p style={{
color:"var(--text-secondary)",
fontSize:14
}}>
Top {topN} coins by market cap — size reflects market cap rank
</p>


</div>




<div style={{
display:"flex",
gap:8,
flexWrap:"wrap",
alignItems:"center"
}}>


<div>

{CHANGE_VIEWS.map(v=>(

<button
key={v.key}
onClick={()=>setChangeKey(v.key)}
>
{v.label}
</button>

))}

</div>



<div>

{SIZE_VIEWS.map(v=>(

<button
key={v.key}
onClick={()=>setSizeMode(v.key)}
>
{v.label}
</button>

))}

</div>



<select
value={topN}
onChange={(e)=>setTopN(Number(e.target.value))}
>

<option value={50}>Top 50</option>
<option value={100}>Top 100</option>

</select>


</div>



</div>





{!loading && coins.length>0 && (

<div style={{
marginBottom:20
}}>

Market Sentiment:

{positive} up /

{negative} down


</div>

)}




<div style={{
display:"flex",
gap:6,
flexWrap:"wrap",
marginBottom:20
}}>


{legend.map(({label,color})=>(

<div key={label}>

<div style={{
width:12,
height:12,
background:color
}}/>

{label}

</div>

))}


</div>





{loading ? (

<div>
Loading...
</div>

) : (

<div style={{
display:"flex",
flexWrap:"wrap",
gap:4
}}>


{sized.map((coin)=>(

<HeatmapTile

key={coin.id}

coin={coin}

size={coin.tileSize}

changeKey={changeKey}

/>

))}



</div>

)}


</div>

  );

}