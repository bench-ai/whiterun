import styled from 'styled-components';
import {Button, Divider, Form} from "antd";
import {Header} from "antd/es/layout/layout";

export const HeaderStyle = styled(Header)`
    position: sticky;
    top: 0;
    z-index: 1;
    display: flex;
    align-items: center;
    padding: 0 25px 0 25px;
    background-color: #0d1117;
`;

export const AddApiForm = styled(Form)`
    .ant-form-item {
        margin-bottom: 10px;
    }
    .ant-form-item-label {
        font-size: 16px;
        font-weight: bold;
    }
`;

export const Profile = styled.div`
  margin: 0 5px;
  cursor: pointer;
`;

export const PopoverContent = styled.div`
    width: 250px;
    vertical-align: center;
`;

export const ButtonPopover = styled(Button)`
    width: 100%;
    display: flex;
    align-items: center
    
`;

export const DividerPopover = styled(Divider)`
    margin: 10px 0;
`;

export const ApiList = styled.div`
  display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  //grid-template-columns: repeat(4, 1fr);
  grid-gap: 30px;
  
  //@media screen and (max-width: 1525px) {
  //  grid-template-columns: repeat(3, 1fr);
  //}
  //
  //@media screen and (max-width: 1000px) {
  //  grid-template-columns: repeat(2, 1fr);
  //}
  //
  //@media screen and (max-width: 700px) {
  //  justify-items: center;
  //  grid-template-columns: repeat(1, 1fr);
  //}
`;
