import {Request, Response} from "express";

function errorHandler(err: Error, req: Request, res: Response, next: any) {
    res
      .status(500)
      .send({ success: false, details: "An error occured on the server", errorTrace: err.message }); 
      // TODO: Perform logging of the error to a database instead of sending it back to the user
};

export default errorHandler;