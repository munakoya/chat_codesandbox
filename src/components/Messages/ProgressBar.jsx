import React from "react";
import { Progress } from "semantic-ui-react";

const ProgressBar = ({ uploadState, percentageUploaded }) => {
  // component respinsible for rendering the file upload progress bar
  return (
    uploadState === "uploading" && (
      <Progress
        className="progress_bar"
        percent={percentageUploaded}
        progress
        indicating
        size="medium"
        inverted
      />
    )
  );
};

export default ProgressBar;
