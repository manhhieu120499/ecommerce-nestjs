import * as React from 'react';
interface OTPComponentProps {
    subject: string;
    otpCode: string;
}
declare function OTPComponent(props: OTPComponentProps): React.JSX.Element;
declare namespace OTPComponent {
    var PreviewProps: OTPComponentProps;
}
export default OTPComponent;
