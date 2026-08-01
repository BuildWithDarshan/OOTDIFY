import {useEffect, useState} from 'react';
import PageHero from "../components/Common/PageHero.jsx";
import TrendRow from '../components/Trend/TrendRow.jsx';
import { getTrends } from '../services/trendService.js';
import trendsBanner from "../assets/images/trends-banner.png"
import trendsBannerMobile from "../assets/images/trends-banner-mobile.png";

const Trends = () => {

    const [trends, setTrends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] =useState(false);   

    useEffect(() => {
        let cancelled = false;

        getTrends()
        .then((data) => {
           if(!cancelled) setTrends(data.trends || []);
        }).catch(() => {
            if (!cancelled) setError(true);
        }).finally(() => {
            if (!cancelled) setLoading(false);
        });

        return () => {
            cancelled = true;
        }
    },[])

    
  return (
    <div>
      <PageHero
        desktopImage={trendsBanner}
        mobileImage={trendsBannerMobile}
        wordmark="TRENDS"
        topRightLabel="EDIT"
        dividerLeft="WHAT'S"
        dividerCenter="SHAPING STYLE RIGHT NOW"
        dividerRight="NEW"
        fullHeight
      />

      {loading && (
          <p className="text-center text-sm text-text-muted py-16">Loading trends...</p>
      )}

      {!loading && error && (
          <p className="text-center text-sm text-text-muted py-16">Something went wrong. Please try again.</p>
      )}

      {!loading && !error && trends.length === 0 && (
          <p className="text-center text-sm text-text-muted py-16">No trends published yet — check back soon.</p>
      )}

      {!loading && !error && trends.length > 0 && (
    <div className="">
        {trends.map((trend, idx) => (
            <TrendRow key={trend._id} trend={trend} reversed={idx % 2 === 1} index={idx}/>
        ))}
    </div>
)}
    </div>
  )
}

export default Trends