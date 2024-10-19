import { Footer } from "antd/es/layout/layout";


const BaseFooter: React.FC = () => {
    return (
        <Footer style={{ textAlign: 'center', padding: "40px" }}>
          Powered by <a href="https://reactjs.org">React</a> and <a href="https://ant.design">Ant Design</a> <br /><br />
          Copyright © 2024 ~ {new Date().getFullYear()} <a href="https://www.saintw.cc">SaintW</a> v0.1
        </Footer>
    );
}

export default BaseFooter;
