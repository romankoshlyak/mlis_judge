FROM ubuntu:18.04

ARG PYTHON_VERSION=3.6.9
ARG PYTORCH_VERSION=1.4.0
ARG VISION_VERSION=0.5.0

RUN apt-get update && apt-get install -y --no-install-recommends \
         curl \
         ca-certificates \
         bzip2 \
         screen \
         git \
         vim && \
     rm -rf /var/lib/apt/lists/*

RUN curl -o ~/miniconda.sh -O  https://repo.continuum.io/miniconda/Miniconda3-latest-Linux-x86_64.sh  && \
     chmod +x ~/miniconda.sh && \
     ~/miniconda.sh -b -p /opt/conda && \
     rm ~/miniconda.sh && \
     /opt/conda/bin/conda install -y python=$PYTHON_VERSION numpy pyaml scipy ipython mkl mkl-include cython typing && \
     /opt/conda/bin/conda install -y pytorch=$PYTORCH_VERSION torchvision=$VISION_VERSION cpuonly -c pytorch && \
     /opt/conda/bin/conda clean -ya

ENV PATH /opt/conda/bin:$PATH

COPY ./ /usr/src/app

WORKDIR /usr/src/app

RUN python -m mlis.problems.tester --problem_name mnist --prepare_case_data_only True

CMD [ "uname" ]
