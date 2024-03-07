import axios, { AxiosResponse } from 'axios';

export const checkStatusAndRetry = async (
    response: AxiosResponse,
    processFunction: () => Promise<AxiosResponse>
): Promise<string | undefined> => {

    let status;
    const startTime = Date.now();

    do {
        const processResponse = await axios.get(
            `${response.data["url"]}`,
            { withCredentials: true }
        );
        status = processResponse.status;

        if (status === 202) {
            const elapsedTime = Date.now() - startTime;
            if (elapsedTime >= 600000) {
                return undefined;
            }
            await new Promise(resolve => setTimeout(resolve, 10000));
        } else if (status === 200) {
            return processResponse.data["url"];
        }
    } while (status === 202);

    return undefined;
};
