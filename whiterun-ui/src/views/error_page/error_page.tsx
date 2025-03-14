import React, {useEffect} from 'react';
import {Button, Layout, Result} from "antd";
import {Link} from "react-router-dom";

const ErrorPage = () => {

    useEffect(() => {
        document.title = 'Error - Bench AI';
    })

    return (
        <div>
            <Layout style={{height: "100vh"}}>
            <Result
                status="404"
                title="404"
                subTitle="Sorry, the page you visited does not exist."
                extra={
                    <Link to="/">
                        <Button type="primary">Back Home</Button>
                    </Link>
                }
            />
            </Layout>
        </div>
    );
};

export default ErrorPage;