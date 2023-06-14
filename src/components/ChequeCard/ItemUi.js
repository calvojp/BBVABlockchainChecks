import { motion, useMotionValue, useTransform } from 'framer-motion';
import React from 'react'
import styled from 'styled-components'
import { ItemDetail } from './ItemDetail';


const CardWrapper = styled.div`
    perspective: 2000;
`;

const CardContainer = styled(motion.div)`
    width: 285px;
    height: 500px;
    display: flex;
    flex-direction: column;
    border-radius: 25px;
    box-shadow: 0px 2px 7px 1px rgba(31, 31, 31, 0.2);
    background-color: #000; // BBVA Blue
    color: #fff;
    position: relative;
    cursor: grab;
`;

const CircleWrapper = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    min-width: 100%;
    min-height: 100%;
    overflow: hidden;
    border-top-right-radius: 25px;
`;

const Circle = styled.div`
    position: absolute;
    width: 325px;
    height: 350px;
    top: -4.2em;
    right: -10em;
    z-index: 5;
    background-color: #004481; // BBVA Blue
    border-radius: 50%;
`
const TopContainer = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    flex: 1.2;
    position: relative;
    align-items: center;
    justify-content: flex-end;
    padding: 1em 15px;
`;

const BottomContainer = styled.div`
    display: flex;
    flex: 0.8;
    padding: 0 1em;
`;

const NikeText = styled.h1`
    color: #fff;
    text-transform: uppercase;
    margin: 0;
    z-index: 10;
    font-size: 40px;
    font-weight: 900;
`

const ShoesWrapper = styled.div`
    width: 100%;
    height: 100%;
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const Shoes = styled(motion.div)`
    width: auto;
    height: 190px;
    z-index: 99;
    usesr-select: none;
    margin-right: 2em;
    margin-top: -3em;
    img{
        width: auto;
        height: 100%;
        user-select: none;
    }
    
`;



export const ItemUi = ({name, description, price, button, img, id}) => {

    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useTransform(y, [-100, 100], [30, -30]);
    const rotateY = useTransform(x, [-100, 100], [30, -30]);


    return (
        <CardWrapper>
            <CardContainer 
                style={{ x, y, rotateX, rotateY, z: 100 }} drag
                dragElastic={0.16}
                dragConstraints={{top :0, left :0, bottom :0, right :0}}
                whileTap={{ cursor : "grabbing"}}
            >
                
                <TopContainer>
                    <CircleWrapper>
                        <Circle/>
                    </CircleWrapper>
                    <ShoesWrapper>
                        <Shoes 
                            // style={{ x, y, rotateX, rotateY, rotate: "-20deg", z:100000 }}
                            drag
                            dragElastic={0.12}
                            whileTap={{ cursor : "grabbing"}}
                        >
                            <img src={img} alt="zapatilla"/>
                        </Shoes>
                    </ShoesWrapper>
                    <NikeText>{name}</NikeText>
                </TopContainer>
                <BottomContainer>
                    <ItemDetail description={description} price={price} id={id}/>
                </BottomContainer>
            </CardContainer>
        </CardWrapper>
    )
}