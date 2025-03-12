import axios from "axios";

const API_URL = "http://127.0.0.1:5000";

export const getTasks = async () => {
    return axios.get(`${API_URL}/tasks`);
};

export const startSolution = async (taskId) => {
    return axios.post(`${API_URL}/tasks/${taskId}/start`);
};

export const checkStep = async (solutionId, stepNumber, prevExpr, currExpr) => {
    return axios.post(`${API_URL}/solutions/${solutionId}/check_step`, {
        step_number: stepNumber, prev_expr: prevExpr, curr_expr: currExpr
    });
};

export const finishSolution = async (solutionId) => {
    return axios.post(`${API_URL}/solutions/${solutionId}/finish`);
};
