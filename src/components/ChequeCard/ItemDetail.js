//import { motion } from 'framer-motion';
import React from 'react'
import { Link } from 'react-router-dom';
import styled from "styled-components"



const DetailsContainer = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 2.5em 6px 0px 6px;
    line-height: 1.4;
`;

const MediumText = styled.span`
    font-size: 18px;
    color: #fff;
    font-weight: 800;
    text-transform: uppercase;
`;

const SmallText = styled.span`
    font-size: 11px;
    text-align: left;
    color: #fff;
    font-weight: 700;
    text-transform: uppercase;
`;

const SpacedHorizontalContainer = styled.div`
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const BuyButton = styled.button`
    padding: 5px 16px;
    background-color: #fff;
    color: #000;
    text-transform: uppercase;
    font-size: 16px;
    font-weight: 700;
    border: 3px solid transparent;
    outline: none;
    cursor: pointer;
    transition: all 290ms ease-in-out;
    border-radius: 5px;
    &:hover {
        background-color: transparent;
        border: 3px solid red;
        color: #fff;
    }
`;

const Marginer = styled.div`
    margin-top: 10px;
`;

const NikeLogo = styled.div`
    width: 100%;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    img{
        width: auto;
        height: 13px;
    }
`;

export const ItemDetail = ({description, price, id}) => {
    return (
        <DetailsContainer>
            <SmallText>
                Cheque
            </SmallText>
            <SpacedHorizontalContainer>
                <MediumText>{description}</MediumText>
                <MediumText>${price}</MediumText>
            </SpacedHorizontalContainer>
            <Marginer />
            <SpacedHorizontalContainer>
        
            <Link className="link-details" exact to={`details/${id}`}> 
                <BuyButton>Cobrar fondos</BuyButton>
            </Link>
                
            </SpacedHorizontalContainer>
            <NikeLogo>
                <img src={"https://www.bbva.com/wp-content/uploads/2019/04/Logo-BBVA.jpg"} alt="nike logo" />
            </NikeLogo>
        </DetailsContainer>
    )
}