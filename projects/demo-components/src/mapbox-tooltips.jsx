import React, { useState } from 'react';
import MapboxTooltip from './mapbox-tooltip';
import LogoSVG from './logo-svg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronUp} from '@fortawesome/free-solid-svg-icons'
import { tooltipData } from './tooltipData';

const MapboxTooltips = ({ products }) => {
    const [ isToggled, setIsToggled ] = useState(false);


    const productsToShow = tooltipData.filter(product => products.includes(product.title));

    function handleClick() {
        setIsToggled(prevState => !prevState);
      }

    return (

    <div className={`${isToggled ? 'relative' : '-translate-y-full absolute'} transition-transform px-3 flex flex-wrap justify-start w-full h-auto py-2 items-center bg-deepgreen overflow-visible z-50`}>
    
        { productsToShow.map((product, index) => (
                <MapboxTooltip 
                    key={index}
                    title={product.title} 
                    content={product.content} />
        ))}

        <div 
            className='transition-all info flex items-center absolute block bg-deepgreen rounded-b-md md:px-4 md:py-2 px-2.5 py-1.5 text-white md:text-base text-sm cursor-pointer'
            onClick={handleClick}>
                <div className="mr-2">
                    <LogoSVG fillColor="white" />
                </div>
                Learn Mapbox
            <FontAwesomeIcon className={`transition ml-2 ${isToggled ? '' : 'rotate-180'}`}icon={faChevronUp} />
        </div>
    </div>
    
    )

}

export default MapboxTooltips;