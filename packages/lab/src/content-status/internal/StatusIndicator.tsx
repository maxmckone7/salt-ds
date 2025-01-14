import {
  makePrefixer,
  StatusIndicator as BaseStatusIndicator,
  StatusIndicatorProps as BaseStatusIndicatorProps,
  Spinner,
  SpinnerProps,
} from "@salt-ds/core";
import { ReactElement } from "react";
import { clsx } from "clsx";

import { CircularProgress, CircularProgressProps } from "../../progress";

export interface StatusIndicatorProps
  extends Pick<SpinnerProps, "disableAnnouncer">,
    Pick<CircularProgressProps, "unit" | "value"> {
  title?: string;
  message?: string;
  CircularProgressProps?: Partial<CircularProgressProps>;
  SpinnerProps?: Partial<SpinnerProps>;
  id?: string;
  status?: BaseStatusIndicatorProps["status"] | "loading";
}

const withBaseName = makePrefixer("saltContentStatus");

export function StatusIndicator({
  status = "info",
  disableAnnouncer,
  unit,
  value,
  title,
  message,
  CircularProgressProps: {
    className: circularProgressClassName,
    ...restCircularProgressProps
  } = {},
  SpinnerProps: { className: spinnerClassName, ...restSpinnerProps } = {},
  id,
}: StatusIndicatorProps): ReactElement {
  if (status === "loading") {
    if (value !== undefined) {
      return (
        <CircularProgress
          aria-label={title || message}
          className={clsx(
            withBaseName("determinateLoading"),
            circularProgressClassName
          )}
          unit={unit}
          value={value}
          {...restCircularProgressProps}
        />
      );
    }
    return (
      <Spinner
        className={clsx(withBaseName("indeterminateLoading"), spinnerClassName)}
        // Announcement of the content status is more useful than completion announcement from spinner
        completionAnnouncement={null}
        data-testid={`spinner-${id!}`}
        disableAnnouncer={disableAnnouncer}
        {...restSpinnerProps}
      />
    );
  }

  return (
    <BaseStatusIndicator
      status={status}
      data-jpmui-test={`icon-${status}-${id!}`}
      size={2}
    />
  );
}
