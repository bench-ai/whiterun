import { Layout, Spin } from 'antd';
import React, {useEffect, useState} from 'react';
import DragAndDrop from '../../testDnd/dnd';

const Workbench = () => {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const artificialLoadingTimeout = setTimeout(() => {
            setLoading(false);
        }, 1000);

        return () => clearTimeout(artificialLoadingTimeout);
    }, []);

    return (
        <Layout>
            <div style={{ position: 'relative', height: '100vh' }}>
                {loading && (
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Spin />
                    </div>
                )}
                <div style={{ opacity: loading ? 0.0 : 1, pointerEvents: loading ? 'none' : 'auto' }}>
                    <DragAndDrop/>
                </div>
            </div>
        </Layout>
    );
};

export default Workbench;