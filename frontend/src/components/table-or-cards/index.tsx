import { useIsMobile } from "@/hooks/useIsMobile";
import { Table, type TableProps } from "antd";
import { Cards } from "./cards";

export interface ITableOrCards extends Partial<TableProps<any>> {}

export const TableOrCards = (props: ITableOrCards) => {
  const isMobile = useIsMobile();

  // Constants
  const rowHeight = 54; // Approximate row height in pixels
  const maxTableHeight = 600; // Maximum table height in pixels

  // Calculate total height based on data length
  const dataLength = props.dataSource?.length || 0;
  const totalHeight = dataLength * rowHeight;

  // Determine scroll.y value
  const scrollY = totalHeight > maxTableHeight ? maxTableHeight : totalHeight;

  if (isMobile) {
    return <Cards {...props} />;
  }

  return (
    <Table
      sticky
      scroll={{
        x: (props.columns?.length || 0) > 8 ? 1800 : 1200,
        y: scrollY,
      }}
      {...props}
    />
  );
};
