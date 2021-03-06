#include "protect.hpp"


namespace orc {
    std::string tunIface;

    void setTunIface(const std::string &iface) {
        tunIface = std::move(iface);
    }

    std::string getTunIface() {
        return tunIface;
    }
}