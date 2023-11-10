# Create a SSL request (for GCP)
## Generate private key
```
openssl genrsa -out PRIVATE_KEY_FILE 2048
```
ref: https://cloud.google.com/load-balancing/docs/ssl-certificates/self-managed-certs
## Generate Certificate Signing Request (CSR)
```
openssl req -new -key PRIVATE_KEY_FILE -out public.csr
```
*Be sure to enter the correct email address (firstname.lastname@hhu.de)*
ref: https://wiki.hhu.de/display/HHU/CSR+unter+Ubuntu

# Apply for a server certificate
Go to this link: https://cert-manager.com/customer/DFN/ssl/aitxMaFXc6Doh3lN4vrH/login

ref: https://www.zim.hhu.de/servicekatalog/netze/server-zertifikate

ref: https://wiki.hhu.de/display/HHU/Serverzertifikat+beantragen

# HTTP2HTTPS
https://cloud.google.com/load-balancing/docs/https/setting-up-http-https-redirect

